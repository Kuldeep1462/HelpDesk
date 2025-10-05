from django.contrib import admin
from .models import Ticket, Comment

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "status", "created_by", "assigned_to", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("title", "description")

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "ticket", "author", "created_at")
    search_fields = ("content",)
