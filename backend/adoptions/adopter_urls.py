from django.urls import path

from adoptions.views import (
    AdopterAdoptionRequestDetailView,
    AdopterAdoptionRequestListCreateView,
)

urlpatterns = [
    path('', AdopterAdoptionRequestListCreateView.as_view(), name='adopter-request-list-create'),
    path('<int:pk>/', AdopterAdoptionRequestDetailView.as_view(), name='adopter-request-detail'),
]
