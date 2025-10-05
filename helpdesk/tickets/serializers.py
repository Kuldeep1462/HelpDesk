from rest_framework import serializers
from .models import Ticket, Comment, TicketEvent
from users.models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'role')

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    parent = serializers.PrimaryKeyRelatedField(queryset=Comment.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Comment
        fields = ('id', 'ticket', 'author', 'content', 'parent', 'created_at')
        read_only_fields = ('ticket', 'author', 'created_at')

class TicketEventSerializer(serializers.ModelSerializer):
    actor = UserSerializer(read_only=True)

    class Meta:
        model = TicketEvent
        fields = ('id', 'action', 'meta', 'actor', 'created_at')

class TicketSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    events = TicketEventSerializer(many=True, read_only=True)
    version = serializers.IntegerField(required=False)

    class Meta:
        model = Ticket
        fields = (
            'id', 'title', 'description', 'status',
            'priority', 'sla_hours', 'due_at', 'version',
            'created_by', 'assigned_to', 'created_at', 'updated_at',
            'comments', 'events'
        )
        read_only_fields = ('created_by', 'assigned_to', 'created_at', 'updated_at', 'due_at')
