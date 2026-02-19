from django.contrib import admin
from django.urls import include, path
from django.views.generic import RedirectView


urlpatterns = [
    path("", RedirectView.as_view(url="/api/accounts/health/", permanent=False)),
    path("admin/", admin.site.urls),
    path("api/accounts/", include("accounts.urls")),
    path("api/notes/", include("notes.urls")),
]
