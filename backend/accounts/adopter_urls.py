from django.urls import path

from accounts.adopter_views import (
    AdopterAccountDeleteView,
    AdopterProfileView,
    DiscoverAnimalDetailView,
    DiscoverAnimalListView,
    DiscoverShelterDetailView,
)

urlpatterns = [
    path('profile/', AdopterProfileView.as_view(), name='adopter-profile'),
    path('account/', AdopterAccountDeleteView.as_view(), name='adopter-account-delete'),
]

discover_urlpatterns = [
    path('animals/', DiscoverAnimalListView.as_view(), name='discover-animal-list'),
    path('animals/<int:pk>/', DiscoverAnimalDetailView.as_view(), name='discover-animal-detail'),
    path('shelters/<int:pk>/', DiscoverShelterDetailView.as_view(), name='discover-shelter-detail'),
]
