from django.urls import path
from .views import TicketListCreateView, TicketDetailView, CommentListCreateView

urlpatterns = [
    path('', TicketListCreateView.as_view(), name='api-ticket-list-create'),
    path('<int:pk>/', TicketDetailView.as_view(), name='api-ticket-detail'),
    path('<int:ticket_id>/comments/', CommentListCreateView.as_view(), name='api-ticket-comments'),
]


