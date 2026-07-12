from django.urls import path

from animals.views import AnimalInactivateView, AnimalListView

urlpatterns = [
    path('', AnimalListView.as_view(), name='animal-list'),
    path('<int:pk>/inactivate/', AnimalInactivateView.as_view(), name='animal-inactivate'),
]
