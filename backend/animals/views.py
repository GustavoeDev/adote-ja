from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsShelter
from animals.models import Animal
from animals.serializers import AnimalListSerializer


class AnimalListView(APIView):
    permission_classes = [IsAuthenticated, IsShelter]

    def get(self, request):
        animals = Animal.objects.filter(
            shelter=request.user.shelter_profile,
            is_active=True,
        )
        return Response(AnimalListSerializer(animals, many=True, context={'request': request}).data)


class AnimalInactivateView(APIView):
    permission_classes = [IsAuthenticated, IsShelter]

    def post(self, request, pk):
        try:
            animal = Animal.objects.get(pk=pk, shelter=request.user.shelter_profile)
        except Animal.DoesNotExist:
            return Response({'detail': 'Animal não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        animal.is_active = False
        animal.save(update_fields=['is_active', 'updated_at'])
        return Response({'message': 'Animal inativado.'}, status=status.HTTP_200_OK)
