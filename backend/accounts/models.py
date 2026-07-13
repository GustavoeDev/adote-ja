from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ADOPTER = 'adopter', 'Adotante'
        SHELTER = 'shelter', 'Abrigo'

    role = models.CharField(max_length=20, choices=Role.choices)
    phone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.email or self.username


class ShelterProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='shelter_profile',
        limit_choices_to={'role': User.Role.SHELTER},
    )
    name = models.CharField(max_length=150)
    cover_photo = models.ImageField(upload_to='shelters/covers/', blank=True, null=True)
    profile_photo = models.ImageField(upload_to='shelters/avatars/', blank=True, null=True)
    about = models.TextField(blank=True)
    public_email = models.EmailField(blank=True)
    public_phone = models.CharField(max_length=20, blank=True)
    website = models.URLField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class AdopterProfile(models.Model):
    class HousingType(models.TextChoices):
        HOUSE = 'Casa', 'Casa'
        APARTMENT = 'Apartamento', 'Apartamento'
        FARM = 'Sítio/Chácara', 'Sítio/Chácara'
        OTHER = 'Outro', 'Outro'

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='adopter_profile',
        limit_choices_to={'role': User.Role.ADOPTER},
    )
    birthdate = models.CharField(max_length=20, blank=True)
    cpf = models.CharField(max_length=14, blank=True)
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    housing_type = models.CharField(max_length=40, blank=True)
    has_yard = models.CharField(max_length=10, blank=True)
    has_screens = models.CharField(max_length=10, blank=True)
    other_pets = models.CharField(max_length=255, blank=True)
    hours_alone = models.CharField(max_length=20, blank=True)
    preferences = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.get_full_name() or self.user.email
