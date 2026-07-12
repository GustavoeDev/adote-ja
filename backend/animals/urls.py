from django.urls import path

from animals.views import (
    AnimalDetailView,
    AnimalInactivateView,
    AnimalListCreateView,
    AnimalMediaCoverView,
    AnimalMediaDeleteView,
    AnimalMediaView,
)

urlpatterns = [
    path('', AnimalListCreateView.as_view(), name='animal-list'),
    path('<int:pk>/', AnimalDetailView.as_view(), name='animal-detail'),
    path('<int:pk>/inactivate/', AnimalInactivateView.as_view(), name='animal-inactivate'),
    path('<int:pk>/media/', AnimalMediaView.as_view(), name='animal-media'),
    path('<int:pk>/media/<int:media_id>/', AnimalMediaDeleteView.as_view(), name='animal-media-delete'),
    path('<int:pk>/media/<int:media_id>/cover/', AnimalMediaCoverView.as_view(), name='animal-media-cover'),
]
