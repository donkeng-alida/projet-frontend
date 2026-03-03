from django.urls import path

from .views import (
    AuditEventListView,
    HealthCheckView,
    LoginView,
    SuperuserLoginView,
    UserListCreateView,
    UserRetrieveUpdateDestroyView,
)


urlpatterns = [
    path("health/", HealthCheckView.as_view(), name="health"),
    path("users/", UserListCreateView.as_view(), name="user-list-create"),
    path("users/<int:pk>/", UserRetrieveUpdateDestroyView.as_view(), name="user-retrieve-update-destroy"),
    path("audit-events/", AuditEventListView.as_view(), name="audit-events"),
    path("login/", LoginView.as_view(), name="login"),
    path("superuser/login/", SuperuserLoginView.as_view(), name="superuser-login"),
]
