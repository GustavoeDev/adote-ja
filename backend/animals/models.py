from django.db import models

from accounts.models import ShelterProfile


class Animal(models.Model):
    class Species(models.TextChoices):
        DOG = 'dog', 'Cão'
        CAT = 'cat', 'Gato'
        OTHER = 'other', 'Outro'

    class Size(models.TextChoices):
        SMALL = 'small', 'Pequeno'
        MEDIUM = 'medium', 'Médio'
        LARGE = 'large', 'Grande'

    class Sex(models.TextChoices):
        MALE = 'male', 'Macho'
        FEMALE = 'female', 'Fêmea'

    class Status(models.TextChoices):
        AVAILABLE = 'available', 'Disponível'
        IN_PROCESS = 'in_process', 'Em processo'
        ADOPTED = 'adopted', 'Adotado'

    shelter = models.ForeignKey(ShelterProfile, on_delete=models.CASCADE, related_name='animals')
    name = models.CharField(max_length=100)
    species = models.CharField(max_length=20, choices=Species.choices)
    breed = models.CharField(max_length=100, blank=True)
    sex = models.CharField(max_length=10, choices=Sex.choices, blank=True)
    age_text = models.CharField(max_length=50, blank=True)
    age_months = models.PositiveIntegerField(null=True, blank=True)
    weight = models.CharField(max_length=30, blank=True)
    size = models.CharField(max_length=20, choices=Size.choices, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)
    description = models.TextField(blank=True)
    vaccinated = models.BooleanField(default=False)
    neutered = models.BooleanField(default=False)
    city = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def display_city(self) -> str:
        if self.city:
            return self.city
        return self.shelter.city if self.shelter_id else ''


class AnimalMedia(models.Model):
    class MediaType(models.TextChoices):
        PHOTO = 'photo', 'Foto'
        VIDEO = 'video', 'Vídeo'

    animal = models.ForeignKey(Animal, on_delete=models.CASCADE, related_name='media')
    file = models.FileField(upload_to='animals/media/')
    media_type = models.CharField(max_length=10, choices=MediaType.choices, default=MediaType.PHOTO)
    is_cover = models.BooleanField(default=False)
    order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f'{self.animal.name} - {self.media_type}'
