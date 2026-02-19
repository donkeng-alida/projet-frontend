from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Role management", {"fields": ("role", "is_approved")}),
    )
    list_display = ("username", "email", "role", "is_active", "is_approved", "is_staff")
    list_filter = ("role", "is_active", "is_staff", "is_approved")
