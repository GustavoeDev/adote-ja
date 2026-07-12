from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsShelter
from animals.models import Animal


class ShelterDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsShelter]

    def get(self, request):
        profile = request.user.shelter_profile
        animals = Animal.objects.filter(shelter=profile, is_active=True)
        return Response({
            'shelter_name': profile.name,
            'total_animals': animals.count(),
            'available': animals.filter(status=Animal.Status.AVAILABLE).count(),
            'in_process': animals.filter(status=Animal.Status.IN_PROCESS).count(),
            'requests_count': 0,
        })
