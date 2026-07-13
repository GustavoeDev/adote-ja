from django.contrib.auth import get_user_model
from django.test import TestCase

from accounts.models import AdopterProfile, ShelterProfile
from adoptions.models import AdoptionRequest
from animals.models import Animal

User = get_user_model()


class AdoptionStatusTransitionTests(TestCase):
    def setUp(self):
        shelter_user = User.objects.create_user(
            username='abrigo@test.com',
            email='abrigo@test.com',
            password='x',
            role=User.Role.SHELTER,
        )
        self.shelter = ShelterProfile.objects.create(user=shelter_user, name='Abrigo Teste')
        self.animal = Animal.objects.create(
            shelter=self.shelter,
            name='Bolinha',
            species=Animal.Species.DOG,
            status=Animal.Status.AVAILABLE,
        )
        self.adopter = User.objects.create_user(
            username='adotante@test.com',
            email='adotante@test.com',
            password='x',
            role=User.Role.ADOPTER,
        )
        AdopterProfile.objects.create(user=self.adopter)
        self.request = AdoptionRequest.objects.create(
            animal=self.animal,
            adopter=self.adopter,
            adopter_name='Maria',
            adopter_email='adotante@test.com',
        )
        self.request.build_initial_timeline()
        self.request.mark_interview_scheduled()
        self.request.advance_to_perform_interview()
        self.request.mark_interview_completed()

    def test_approve_sets_animal_adopted(self):
        self.assertEqual(self.animal.status, Animal.Status.IN_PROCESS)
        self.request.mark_approved()
        self.animal.refresh_from_db()
        self.assertEqual(self.request.status, AdoptionRequest.Status.APPROVED)
        self.assertEqual(self.animal.status, Animal.Status.ADOPTED)

    def test_reject_sets_animal_available_when_no_other_active(self):
        self.assertEqual(self.animal.status, Animal.Status.IN_PROCESS)
        self.request.mark_rejected('Perfil incompatível com o animal.')
        self.animal.refresh_from_db()
        self.assertEqual(self.request.status, AdoptionRequest.Status.REJECTED)
        self.assertEqual(self.animal.status, Animal.Status.AVAILABLE)

    def test_reject_keeps_in_process_if_other_active_request(self):
        other_adopter = User.objects.create_user(
            username='outro@test.com',
            email='outro@test.com',
            password='x',
            role=User.Role.ADOPTER,
        )
        AdopterProfile.objects.create(user=other_adopter)
        other = AdoptionRequest.objects.create(
            animal=self.animal,
            adopter=other_adopter,
            adopter_name='Ana',
            adopter_email='outro@test.com',
        )
        other.build_initial_timeline()

        self.request.mark_rejected('Perfil incompatível com o animal.')
        self.animal.refresh_from_db()
        self.assertEqual(self.animal.status, Animal.Status.IN_PROCESS)
