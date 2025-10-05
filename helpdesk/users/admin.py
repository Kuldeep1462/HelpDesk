from django.contrib import admin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "email", "role", "is_active", "is_staff")
    list_filter = ("role", "is_staff", "is_active")
    search_fields = ("username", "email")
