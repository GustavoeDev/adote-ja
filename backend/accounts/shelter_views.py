from rest_framework import status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsShelter
from accounts.serializers import ShelterProfileSerializer
from adoptions.models import AdoptionRequest
from animals.models import Animal


class ShelterDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsShelter]

    def get(self, request):
        profile = request.user.shelter_profile
        animals = Animal.objects.filter(shelter=profile)
        requests = AdoptionRequest.objects.filter(animal__shelter=profile)
        return Response({
            'shelter_name': profile.name,
            'total_animals': animals.count(),
            'pending_requests': requests.filter(status=AdoptionRequest.Status.PENDING).count(),
            'in_progress_requests': requests.filter(status=AdoptionRequest.Status.IN_PROGRESS).count(),
            'adopted_animals': animals.filter(status=Animal.Status.ADOPTED).count(),
        })


class ShelterProfileView(APIView):
    permission_classes = [IsAuthenticated, IsShelter]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get(self, request):
        profile = request.user.shelter_profile
        return Response(ShelterProfileSerializer(profile, context={'request': request}).data)

    def patch(self, request):
        profile = request.user.shelter_profile
        serializer = ShelterProfileSerializer(
            profile,
            data=request.data,
            partial=True,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(ShelterProfileSerializer(profile, context={'request': request}).data)


class ShelterCoverUploadView(APIView):
    permission_classes = [IsAuthenticated, IsShelter]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        profile = request.user.shelter_profile
        cover = request.FILES.get('cover_photo')
        if not cover:
            return Response(
                {'detail': 'Arquivo de capa é obrigatório.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not cover.content_type.startswith('image/'):
            return Response(
                {'detail': 'A capa deve ser uma imagem.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if profile.cover_photo:
            profile.cover_photo.delete(save=False)
        profile.cover_photo = cover
        profile.save(update_fields=['cover_photo', 'updated_at'])
        return Response(ShelterProfileSerializer(profile, context={'request': request}).data)


class ShelterAvatarUploadView(APIView):
    permission_classes = [IsAuthenticated, IsShelter]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        profile = request.user.shelter_profile
        photo = request.FILES.get('profile_photo')
        if not photo:
            return Response(
                {'detail': 'Arquivo de foto de perfil é obrigatório.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not photo.content_type.startswith('image/'):
            return Response(
                {'detail': 'A foto de perfil deve ser uma imagem.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if profile.profile_photo:
            profile.profile_photo.delete(save=False)
        profile.profile_photo = photo
        profile.save(update_fields=['profile_photo', 'updated_at'])
        return Response(ShelterProfileSerializer(profile, context={'request': request}).data)
