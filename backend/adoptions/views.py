from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsShelter
from adoptions.models import AdoptionRequest
from adoptions.serializers import AdoptionRequestSerializer


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
        if status_filter in {
            AdoptionRequest.Status.PENDING,
            AdoptionRequest.Status.APPROVED,
            AdoptionRequest.Status.REJECTED,
        }:
            qs = qs.filter(status=status_filter)

        serializer = AdoptionRequestSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)


class ShelterAdoptionRequestDetailView(APIView):
    permission_classes = [IsAuthenticated, IsShelter]

    def get_object(self, request, pk):
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

    def get(self, request, pk):
        obj = self.get_object(request, pk)
        if not obj:
            return Response({'detail': 'Solicitação não encontrada.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(AdoptionRequestSerializer(obj, context={'request': request}).data)


class ShelterAdoptionRequestApproveView(APIView):
    permission_classes = [IsAuthenticated, IsShelter]

    def post(self, request, pk):
        profile = request.user.shelter_profile
        try:
            obj = (
                AdoptionRequest.objects
                .filter(animal__shelter=profile)
                .select_related('animal')
                .prefetch_related('animal__media', 'timeline_events')
                .get(pk=pk)
            )
        except AdoptionRequest.DoesNotExist:
            return Response({'detail': 'Solicitação não encontrada.'}, status=status.HTTP_404_NOT_FOUND)

        if obj.status != AdoptionRequest.Status.PENDING:
            return Response(
                {'detail': 'Somente solicitações pendentes podem ser aprovadas.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        obj.mark_approved()
        obj.refresh_from_db()
        obj = (
            AdoptionRequest.objects
            .select_related('animal')
            .prefetch_related('animal__media', 'timeline_events')
            .get(pk=obj.pk)
        )
        return Response(AdoptionRequestSerializer(obj, context={'request': request}).data)


class ShelterAdoptionRequestRejectView(APIView):
    permission_classes = [IsAuthenticated, IsShelter]

    def post(self, request, pk):
        profile = request.user.shelter_profile
        try:
            obj = (
                AdoptionRequest.objects
                .filter(animal__shelter=profile)
                .select_related('animal')
                .prefetch_related('animal__media', 'timeline_events')
                .get(pk=pk)
            )
        except AdoptionRequest.DoesNotExist:
            return Response({'detail': 'Solicitação não encontrada.'}, status=status.HTTP_404_NOT_FOUND)

        if obj.status != AdoptionRequest.Status.PENDING:
            return Response(
                {'detail': 'Somente solicitações pendentes podem ser recusadas.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        obj.mark_rejected()
        obj = (
            AdoptionRequest.objects
            .select_related('animal')
            .prefetch_related('animal__media', 'timeline_events')
            .get(pk=obj.pk)
        )
        return Response(AdoptionRequestSerializer(obj, context={'request': request}).data)
