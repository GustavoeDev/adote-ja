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
