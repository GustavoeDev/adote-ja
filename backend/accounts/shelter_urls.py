from django.urls import path

from accounts.shelter_views import ShelterDashboardView

urlpatterns = [
    path('dashboard/', ShelterDashboardView.as_view(), name='shelter-dashboard'),
]
