from django.urls import path

from .views import NoteDetailView, NotePublishView, NotesView


urlpatterns = [
    path("", NotesView.as_view(), name="notes"),
    path("publish/", NotePublishView.as_view(), name="notes-publish"),
    path("<int:note_id>/", NoteDetailView.as_view(), name="note-detail"),
]
