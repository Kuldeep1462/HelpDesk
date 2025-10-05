from django.db import models
from django.conf import settings
from datetime import timedelta

class Ticket(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('closed', 'Closed'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tickets_created'
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='tickets_assigned'
    )
    priority = models.CharField(max_length=10, default='medium')
    sla_hours = models.PositiveIntegerField(default=48)
    due_at = models.DateTimeField(null=True, blank=True)
    version = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.status}"

    def save(self, *args, **kwargs):
        if not self.due_at and self.sla_hours:
            from django.utils import timezone
            self.due_at = timezone.now() + timedelta(hours=self.sla_hours)
        super().save(*args, **kwargs)


class Comment(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.author.username} on {self.ticket.title}"


class TicketEvent(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='events')
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=50)
    meta = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.action} on {self.ticket_id}"


class IdempotencyRecord(models.Model):
    key = models.CharField(max_length=200)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    path = models.CharField(max_length=255)
    method = models.CharField(max_length=10)
    created_object_type = models.CharField(max_length=50)
    created_object_id = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("key", "user", "path", "method")
