from django.contrib.auth import logout
from django.db.models import Case, IntegerField, Q, When
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.adopter_serializers import (
    AdopterProfileSerializer,
    DiscoverAnimalDetailSerializer,
    DiscoverAnimalListSerializer,
    PublicShelterSerializer,
)
from accounts.models import AdopterProfile, ShelterProfile
from accounts.permissions import IsAdopter
from animals.models import Animal


def get_or_create_adopter_profile(user):
    profile, _ = AdopterProfile.objects.get_or_create(user=user)
    return profile


class AdopterProfileView(APIView):
    permission_classes = [IsAuthenticated, IsAdopter]

    def get(self, request):
        profile = get_or_create_adopter_profile(request.user)
        return Response(AdopterProfileSerializer(profile, context={'request': request}).data)

    def patch(self, request):
        profile = get_or_create_adopter_profile(request.user)
        serializer = AdopterProfileSerializer(
            profile,
            data=request.data,
            partial=True,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(AdopterProfileSerializer(profile, context={'request': request}).data)


class AdopterAccountDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdopter]

    def delete(self, request):
        password = request.data.get('password', '')
        if not password or not request.user.check_password(password):
            return Response(
                {'detail': 'Senha incorreta.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = request.user
        logout(request)
        user.delete()
        return Response({'message': 'Conta excluída.'}, status=status.HTTP_200_OK)


class DiscoverAnimalListView(APIView):
    permission_classes = [IsAuthenticated, IsAdopter]

    def get(self, request):
        qs = (
            Animal.objects
            .filter(is_active=True)
            .exclude(status=Animal.Status.ADOPTED)
            .select_related('shelter')
            .prefetch_related('media')
            .annotate(
                status_order=Case(
                    When(status=Animal.Status.AVAILABLE, then=0),
                    When(status=Animal.Status.IN_PROCESS, then=1),
                    default=2,
                    output_field=IntegerField(),
                ),
            )
            .order_by('status_order', '-created_at')
        )

        species = request.query_params.get('species')
        if species in {choice.value for choice in Animal.Species}:
            qs = qs.filter(species=species)

        city = request.query_params.get('city')
        if city:
            city = city.strip()
            qs = qs.filter(Q(city__icontains=city) | Q(shelter__city__icontains=city))

        q = (request.query_params.get('q') or '').strip()
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(breed__icontains=q))

        serializer = DiscoverAnimalListSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)


class DiscoverAnimalDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdopter]

    def get(self, request, pk):
        try:
            animal = (
                Animal.objects
                .filter(is_active=True)
                .select_related('shelter')
                .prefetch_related('media')
                .get(pk=pk)
            )
        except Animal.DoesNotExist:
            return Response({'detail': 'Animal não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        has_active = animal.adoption_requests.filter(
            adopter=request.user,
            status__in=['pending', 'in_progress'],
        ).exists()

        serializer = DiscoverAnimalDetailSerializer(
            animal,
            context={'request': request, 'has_active_request': has_active},
        )
        return Response(serializer.data)


class DiscoverShelterDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdopter]

    def get(self, request, pk):
        try:
            shelter = ShelterProfile.objects.prefetch_related('animals__media').get(pk=pk)
        except ShelterProfile.DoesNotExist:
            return Response({'detail': 'Abrigo não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(PublicShelterSerializer(shelter, context={'request': request}).data)
