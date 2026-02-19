from django.contrib import admin

from .models import Note


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ("id", "teacher", "cycle", "matiere", "etudiant", "note", "created_at")
    list_filter = ("cycle", "matiere")
    search_fields = ("etudiant", "matiere", "teacher__username")
