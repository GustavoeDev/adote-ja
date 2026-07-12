from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsShelter
from adoptions.models import AdoptionRequest
from adoptions.serializers import AdoptionRequestSerializer


def get_shelter_request(request, pk):
    profile = request.user.shelter_profile
    try:
        return (
            AdoptionRequest.objects
            .filter(animal__shelter=profile)
            .select_related('animal', 'adopter')
            .prefetch_related('animal__media', 'timeline_events')
            .get(pk=pk)
        )
    except AdoptionRequest.DoesNotExist:
        return None


def serialize_request(obj, request):
    obj = (
        AdoptionRequest.objects
        .select_related('animal', 'adopter')
        .prefetch_related('animal__media', 'timeline_events')
        .get(pk=obj.pk)
    )
    return AdoptionRequestSerializer(obj, context={'request': request}).data


class ShelterAdoptionRequestListView(APIView):
    permission_classes = [IsAuthenticated, IsShelter]

    def get(self, request):
        profile = request.user.shelter_profile
        qs = (
            AdoptionRequest.objects
            .filter(animal__shelter=profile)
            .select_related('animal', 'adopter')
            .prefetch_related('animal__media', 'timeline_events')
        )

        status_filter = request.query_params.get('status')
        if status_filter in {choice.value for choice in AdoptionRequest.Status}:
            qs = qs.filter(status=status_filter)

        serializer = AdoptionRequestSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)


class ShelterAdoptionRequestDetailView(APIView):
    permission_classes = [IsAuthenticated, IsShelter]

    def get(self, request, pk):
        obj = get_shelter_request(request, pk)
        if not obj:
            return Response({'detail': 'Solicitação não encontrada.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(AdoptionRequestSerializer(obj, context={'request': request}).data)


class ShelterAdoptionRequestScheduleInterviewView(APIView):
    permission_classes = [IsAuthenticated, IsShelter]

    def post(self, request, pk):
        obj = get_shelter_request(request, pk)
        if not obj:
            return Response({'detail': 'Solicitação não encontrada.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            obj.mark_interview_scheduled()
        except ValueError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serialize_request(obj, request))


class ShelterAdoptionRequestStartInterviewView(APIView):
    """Avança de 'Entrevista agendada' (verde) para 'Realizar entrevista' (amarelo)."""

    permission_classes = [IsAuthenticated, IsShelter]

    def post(self, request, pk):
        obj = get_shelter_request(request, pk)
        if not obj:
            return Response({'detail': 'Solicitação não encontrada.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            obj.advance_to_perform_interview()
        except ValueError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serialize_request(obj, request))


class ShelterAdoptionRequestCompleteInterviewView(APIView):
    permission_classes = [IsAuthenticated, IsShelter]

    def post(self, request, pk):
        obj = get_shelter_request(request, pk)
        if not obj:
            return Response({'detail': 'Solicitação não encontrada.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            obj.mark_interview_completed()
        except ValueError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serialize_request(obj, request))


class ShelterAdoptionRequestApproveView(APIView):
    permission_classes = [IsAuthenticated, IsShelter]

    def post(self, request, pk):
        obj = get_shelter_request(request, pk)
        if not obj:
            return Response({'detail': 'Solicitação não encontrada.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            obj.mark_approved()
        except ValueError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serialize_request(obj, request))


class ShelterAdoptionRequestRejectView(APIView):
    permission_classes = [IsAuthenticated, IsShelter]

    def post(self, request, pk):
        obj = get_shelter_request(request, pk)
        if not obj:
            return Response({'detail': 'Solicitação não encontrada.'}, status=status.HTTP_404_NOT_FOUND)
        reason = request.data.get('reason', '')
        try:
            obj.mark_rejected(reason)
        except ValueError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serialize_request(obj, request))
