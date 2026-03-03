from django.contrib import admin

from .models import StudentRequest


@admin.register(StudentRequest)
class StudentRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "student", "cycle", "filiere", "subject", "status", "created_at")
    list_filter = ("status", "cycle", "filiere")
    search_fields = ("student__username", "student__email", "subject", "justification")

