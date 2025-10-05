from rest_framework import generics, permissions, filters
from rest_framework.response import Response
from rest_framework.exceptions import APIException, PermissionDenied
from rest_framework.throttling import UserRateThrottle
from django.utils import timezone
from django.db.models import Q
from .models import Ticket, Comment, TicketEvent, IdempotencyRecord
from .serializers import TicketSerializer, CommentSerializer
from django.shortcuts import render, redirect, get_object_or_404


def ticket_list_view(request):
	tickets = Ticket.objects.all()
	return render(request, 'tickets_list.html', {'tickets': tickets})


def ticket_detail_view(request, pk):
	ticket = get_object_or_404(Ticket, pk=pk)
	if request.method == 'POST':
		content = request.POST.get('content')
		Comment.objects.create(ticket=ticket, author=request.user, content=content)
		return redirect('ticket-detail', pk=pk)
	return render(request, 'ticket_detail.html', {'ticket': ticket})


def ticket_create_view(request):
	if request.method == 'POST':
		title = request.POST.get('title')
		description = request.POST.get('description')
		Ticket.objects.create(title=title, description=description, created_by=request.user)
		return redirect('ticket-list-create')
	return render(request, 'ticket_create.html')


# Ticket Views
class TicketListCreateView(generics.ListCreateAPIView):
	serializer_class = TicketSerializer
	permission_classes = [permissions.IsAuthenticated]
	filter_backends = [filters.SearchFilter]
	search_fields = ['title', 'description', 'comments__content']
	throttle_classes = [UserRateThrottle]

	def get_queryset(self):
		queryset = Ticket.objects.all().order_by('-created_at')
		breached = self.request.query_params.get('breached')
		if breached in ['1', 'true', 'True']:
			queryset = queryset.filter(due_at__lt=timezone.now()).exclude(status='closed')
		return queryset.distinct()

	def list(self, request, *args, **kwargs):
		limit = request.query_params.get('limit')
		offset = request.query_params.get('offset')
		queryset = self.filter_queryset(self.get_queryset())
		next_offset = None
		if limit is not None:
			try:
				limit_int = max(0, int(limit))
				offset_int = int(offset or 0)
			except ValueError:
				limit_int, offset_int = None, None
			if limit_int is not None:
				items = list(queryset[offset_int:offset_int + limit_int])
				if offset_int + limit_int < queryset.count():
					next_offset = offset_int + limit_int
				serializer = self.get_serializer(items, many=True)
				return Response({"items": serializer.data, "next_offset": next_offset})
		serializer = self.get_serializer(queryset, many=True)
		return Response({"items": serializer.data, "next_offset": next_offset})

	def perform_create(self, serializer):
		idem_key = self.request.headers.get('Idempotency-Key')
		if idem_key:
			try:
				record = IdempotencyRecord.objects.get(
					key=idem_key, user=self.request.user, path=self.request.path, method=self.request.method
				)
				self.existing_obj_id = record.created_object_id
				return
			except IdempotencyRecord.DoesNotExist:
				pass

		ticket = serializer.save(created_by=self.request.user)
		if idem_key:
			IdempotencyRecord.objects.create(
				key=idem_key, user=self.request.user, path=self.request.path, method=self.request.method,
				created_object_type='ticket', created_object_id=ticket.id
			)
		TicketEvent.objects.create(ticket=ticket, actor=self.request.user, action='created', meta={})

	def create(self, request, *args, **kwargs):
		self.existing_obj_id = None
		response = super().create(request, *args, **kwargs)
		if getattr(self, 'existing_obj_id', None):
			ticket = Ticket.objects.get(id=self.existing_obj_id)
			serializer = self.get_serializer(ticket)
			return Response(serializer.data, status=200)
		return response


class Conflict(APIException):
	status_code = 409
	default_detail = 'Conflict: stale update.'
	default_code = 'conflict'


class TicketDetailView(generics.RetrieveUpdateDestroyAPIView):
	queryset = Ticket.objects.all()
	serializer_class = TicketSerializer
	permission_classes = [permissions.IsAuthenticated]
	throttle_classes = [UserRateThrottle]

	def perform_update(self, serializer):
		user = self.request.user
		instance = self.get_object()
		if not (user.role in ['agent', 'admin'] or instance.created_by_id == user.id):
			raise PermissionDenied('Not allowed to update this ticket')

		incoming_version = self.request.data.get('version')
		if incoming_version is None or int(incoming_version) != instance.version:
			raise Conflict('Stale version. Reload and try again.')

		old_status = instance.status
		old_assigned = instance.assigned_to_id

		updated = serializer.save(version=instance.version + 1)

		if old_status != updated.status:
			TicketEvent.objects.create(ticket=updated, actor=user, action='status_changed', meta={'from': old_status, 'to': updated.status})
		if old_assigned != updated.assigned_to_id:
			TicketEvent.objects.create(ticket=updated, actor=user, action='assigned', meta={'to': updated.assigned_to_id})

	def perform_destroy(self, instance):
		user = self.request.user
		if user.role != 'admin':
			raise PermissionDenied('Only admin can delete tickets')
		TicketEvent.objects.create(ticket=instance, actor=user, action='deleted', meta={})
		return super().perform_destroy(instance)


# Comment Views
class CommentListCreateView(generics.ListCreateAPIView):
	serializer_class = CommentSerializer
	permission_classes = [permissions.IsAuthenticated]
	throttle_classes = [UserRateThrottle]

	def get_queryset(self):
		ticket_id = self.kwargs['ticket_id']
		return Comment.objects.filter(ticket_id=ticket_id).order_by('created_at')

	def perform_create(self, serializer):
		ticket_id = self.kwargs['ticket_id']
		dem_key = self.request.headers.get('Idempotency-Key')
		if dem_key:
			try:
				record = IdempotencyRecord.objects.get(
					key=dem_key, user=self.request.user, path=self.request.path, method=self.request.method
				)
				self.existing_comment_id = record.created_object_id
				return
			except IdempotencyRecord.DoesNotExist:
				pass

		comment = serializer.save(author=self.request.user, ticket_id=ticket_id)
		if dem_key:
			IdempotencyRecord.objects.create(
				key=dem_key, user=self.request.user, path=self.request.path, method=self.request.method,
				created_object_type='comment', created_object_id=comment.id
			)
		TicketEvent.objects.create(ticket_id=ticket_id, actor=self.request.user, action='commented', meta={'comment_id': comment.id})

	def create(self, request, *args, **kwargs):
		self.existing_comment_id = None
		response = super().create(request, *args, **kwargs)
		if getattr(self, 'existing_comment_id', None):
			comment = Comment.objects.get(id=self.existing_comment_id)
			serializer = self.get_serializer(comment)
			return Response(serializer.data, status=200)
		return response
