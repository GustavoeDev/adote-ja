from django.urls import path

from adoptions.views import (
    ShelterAdoptionRequestApproveView,
    ShelterAdoptionRequestCompleteInterviewView,
    ShelterAdoptionRequestDetailView,
    ShelterAdoptionRequestListView,
    ShelterAdoptionRequestRejectView,
    ShelterAdoptionRequestScheduleInterviewView,
    ShelterAdoptionRequestStartInterviewView,
)

urlpatterns = [
    path('', ShelterAdoptionRequestListView.as_view(), name='shelter-request-list'),
    path('<int:pk>/', ShelterAdoptionRequestDetailView.as_view(), name='shelter-request-detail'),
    path(
        '<int:pk>/schedule-interview/',
        ShelterAdoptionRequestScheduleInterviewView.as_view(),
        name='shelter-request-schedule-interview',
    ),
    path(
        '<int:pk>/start-interview/',
        ShelterAdoptionRequestStartInterviewView.as_view(),
        name='shelter-request-start-interview',
    ),
    path(
        '<int:pk>/complete-interview/',
        ShelterAdoptionRequestCompleteInterviewView.as_view(),
        name='shelter-request-complete-interview',
    ),
    path('<int:pk>/approve/', ShelterAdoptionRequestApproveView.as_view(), name='shelter-request-approve'),
    path('<int:pk>/reject/', ShelterAdoptionRequestRejectView.as_view(), name='shelter-request-reject'),
]
