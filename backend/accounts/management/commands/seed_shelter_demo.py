from django.core.management.base import BaseCommand

from accounts.models import ShelterProfile, User
from animals.models import Animal


class Command(BaseCommand):
    help = 'Cria abrigo de demo com animais para o dashboard'

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

        for data in animals_data:
            Animal.objects.get_or_create(
                shelter=profile,
                name=data['name'],
                defaults={
                    **data,
                    'city': profile.city,
                    'description': f'{data["name"]} aguarda um lar amoroso.',
                },
            )

        self.stdout.write(self.style.SUCCESS('Dados de demo do abrigo criados.'))
        self.stdout.write('Abrigo: abrigo@adoteja.com / Abrigo123!')
