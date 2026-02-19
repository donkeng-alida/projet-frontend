from django.urls import path

from .views import HealthCheckView, LoginView, UserListCreateView


urlpatterns = [
    path("health/", HealthCheckView.as_view(), name="health"),
    path("users/", UserListCreateView.as_view(), name="user-list-create"),
    path("login/", LoginView.as_view(), name="login"),
]