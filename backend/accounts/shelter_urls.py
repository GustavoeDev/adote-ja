from django.urls import path

from accounts.shelter_views import (
    ShelterAvatarUploadView,
    ShelterCoverUploadView,
    ShelterDashboardView,
    ShelterProfileView,
)

urlpatterns = [
    path('dashboard/', ShelterDashboardView.as_view(), name='shelter-dashboard'),
    path('profile/', ShelterProfileView.as_view(), name='shelter-profile'),
    path('profile/cover/', ShelterCoverUploadView.as_view(), name='shelter-cover'),
    path('profile/avatar/', ShelterAvatarUploadView.as_view(), name='shelter-avatar'),
]
