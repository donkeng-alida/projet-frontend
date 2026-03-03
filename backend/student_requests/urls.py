from django.urls import path

from .views import StudentRequestView


urlpatterns = [
    path("", StudentRequestView.as_view(), name="student-requests"),
]

