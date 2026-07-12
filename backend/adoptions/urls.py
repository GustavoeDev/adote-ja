from django.urls import path

from adoptions.views import (
    ShelterAdoptionRequestApproveView,
    ShelterAdoptionRequestDetailView,
    ShelterAdoptionRequestListView,
    ShelterAdoptionRequestRejectView,
)

urlpatterns = [
    path('', ShelterAdoptionRequestListView.as_view(), name='shelter-request-list'),
    path('<int:pk>/', ShelterAdoptionRequestDetailView.as_view(), name='shelter-request-detail'),
    path('<int:pk>/approve/', ShelterAdoptionRequestApproveView.as_view(), name='shelter-request-approve'),
    path('<int:pk>/reject/', ShelterAdoptionRequestRejectView.as_view(), name='shelter-request-reject'),
]
