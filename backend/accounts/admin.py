from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import AuditEvent, User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Role management", {"fields": ("role", "is_approved")}),
    )
    list_display = ("username", "email", "role", "is_active", "is_approved", "is_staff")
    list_filter = ("role", "is_active", "is_staff", "is_approved")


@admin.register(AuditEvent)
class AuditEventAdmin(admin.ModelAdmin):
    list_display = ("id", "created_at", "event_type", "actor", "method", "status_code")
    list_filter = ("event_type", "method", "status_code", "created_at")
    search_fields = ("message", "path", "actor__username", "actor__email")
    readonly_fields = ("created_at",)
