from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import ShelterProfile, User
from adoptions.models import AdoptionRequest
from animals.models import Animal


class Command(BaseCommand):
    help = 'Cria abrigo de demo com animais e solicitações de adoção'

    def handle(self, *args, **options):
        shelter_user, created = User.objects.get_or_create(
            email='abrigo@adoteja.com',
            defaults={
                'username': 'abrigo@adoteja.com',
                'role': User.Role.SHELTER,
                'phone': '(11) 3344-5566',
                'first_name': 'Abrigo Lar Feliz',
            },
        )
        if created:
            shelter_user.set_password('Abrigo123!')
            shelter_user.save()

        profile, _ = ShelterProfile.objects.get_or_create(
            user=shelter_user,
            defaults={
                'name': 'Abrigo Lar Feliz',
                'about': 'ONG dedicada a resgatar e encontrar lares amorosos para animais.',
                'public_email': 'contato@larfeliz.org.br',
                'public_phone': '(11) 3344-5566',
                'city': 'São Paulo, SP',
                'is_verified': True,
            },
        )

        animals_data = [
            {
                'name': 'Bolinha', 'species': 'dog', 'breed': 'Golden Retriever',
                'age_text': '2 anos', 'age_months': 24, 'weight': '28 kg', 'size': 'large',
                'status': 'available', 'vaccinated': True, 'neutered': True,
            },
            {
                'name': 'Thor', 'species': 'dog', 'breed': 'Labrador',
                'age_text': '3 anos', 'age_months': 36, 'weight': '32 kg', 'size': 'large',
                'status': 'in_process', 'vaccinated': True, 'neutered': True,
            },
            {
                'name': 'Luna', 'species': 'cat', 'breed': 'Persa',
                'age_text': '1 ano', 'age_months': 12, 'weight': '4 kg', 'size': 'small',
                'status': 'available', 'vaccinated': True, 'neutered': False,
            },
        ]

        animals = {}
        for data in animals_data:
            animal, _ = Animal.objects.get_or_create(
                shelter=profile,
                name=data['name'],
                defaults={
                    **data,
                    'city': profile.city,
                    'description': f'{data["name"]} aguarda um lar amoroso.',
                },
            )
            animals[animal.name] = animal

        maria, maria_created = User.objects.get_or_create(
            email='maria.silva@email.com',
            defaults={
                'username': 'maria.silva@email.com',
                'role': User.Role.ADOPTER,
                'phone': '(11) 98765-4321',
                'first_name': 'Maria',
                'last_name': 'Silva',
            },
        )
        if maria_created:
            maria.set_password('Adotante123!')
            maria.save()

        ana, ana_created = User.objects.get_or_create(
            email='ana@email.com',
            defaults={
                'username': 'ana@email.com',
                'role': User.Role.ADOPTER,
                'phone': '(31) 94567-8901',
                'first_name': 'Ana',
                'last_name': 'Costa',
            },
        )
        if ana_created:
            ana.set_password('Adotante123!')
            ana.save()

        now = timezone.now()
        demo_requests = [
            {
                'animal': animals['Bolinha'],
                'adopter': maria,
                'adopter_name': 'Maria Silva',
                'adopter_phone': '(11) 98765-4321',
                'adopter_email': 'maria.silva@email.com',
                'adopter_city': 'São Paulo, SP',
                'status': AdoptionRequest.Status.PENDING,
                'created_delta': timedelta(days=1),
            },
            {
                'animal': animals['Luna'],
                'adopter': maria,
                'adopter_name': 'Maria Silva',
                'adopter_phone': '(11) 98765-4321',
                'adopter_email': 'maria.silva@email.com',
                'adopter_city': 'São Paulo, SP',
                'status': AdoptionRequest.Status.APPROVED,
                'created_delta': timedelta(days=9),
            },
            {
                'animal': animals['Thor'],
                'adopter': ana,
                'adopter_name': 'Ana Costa',
                'adopter_phone': '(31) 94567-8901',
                'adopter_email': 'ana@email.com',
                'adopter_city': 'Belo Horizonte, MG',
                'status': AdoptionRequest.Status.REJECTED,
                'created_delta': timedelta(days=13),
            },
        ]

        for data in demo_requests:
            existing = AdoptionRequest.objects.filter(
                animal=data['animal'],
                adopter=data['adopter'],
            ).first()
            if existing:
                continue

            req = AdoptionRequest.objects.create(
                animal=data['animal'],
                adopter=data['adopter'],
                adopter_name=data['adopter_name'],
                adopter_phone=data['adopter_phone'],
                adopter_email=data['adopter_email'],
                adopter_city=data['adopter_city'],
                status=AdoptionRequest.Status.PENDING,
                message='Gostaria muito de adotar este animal.',
            )
            AdoptionRequest.objects.filter(pk=req.pk).update(
                created_at=now - data['created_delta'],
            )
            req.refresh_from_db()
            req.build_initial_timeline()

            if data['status'] == AdoptionRequest.Status.APPROVED:
                req.mark_approved()
            elif data['status'] == AdoptionRequest.Status.REJECTED:
                req.mark_rejected()

        self.stdout.write(self.style.SUCCESS('Dados de demo do abrigo criados.'))
        self.stdout.write('Abrigo: abrigo@adoteja.com / Abrigo123!')
        self.stdout.write('Pedidos de adoção de demo disponíveis em /abrigo/pedidos')
