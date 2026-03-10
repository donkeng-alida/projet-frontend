from django.urls import path
from .views import (
    coordinator_cycle,
    AuditEventListView,
    HealthCheckView,
    LoginView,
    SuperuserLoginView,
    StudentListView,
    UserListCreateView,
    UserRetrieveUpdateDestroyView,
)

urlpatterns = [
    path("coordinator/cycle/", coordinator_cycle, name="coordinator-cycle"),
    path("health/", HealthCheckView.as_view(), name="health"),
    path("students/", StudentListView.as_view(), name="student-list"),
    path("users/", UserListCreateView.as_view(), name="user-list-create"),
    path("users/<int:pk>/", UserRetrieveUpdateDestroyView.as_view(), name="user-retrieve-update-destroy"),
    path("audit-events/", AuditEventListView.as_view(), name="audit-events"),
    path("login/", LoginView.as_view(), name="login"),
    path("superuser/login/", SuperuserLoginView.as_view(), name="superuser-login"),
]
