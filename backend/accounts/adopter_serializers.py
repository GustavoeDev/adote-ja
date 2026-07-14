from rest_framework import serializers

from accounts.cpf import is_valid_cpf, normalize_cpf
from accounts.models import AdopterProfile, ShelterProfile
from animals.models import Animal, AnimalMedia
from animals.serializers import AnimalListSerializer, AnimalMediaSerializer


class AdopterProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=False)
    phone = serializers.CharField(source='user.phone', required=False, allow_blank=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    initials = serializers.SerializerMethodField()

    class Meta:
        model = AdopterProfile
        fields = [
            'name',
            'email',
            'phone',
            'cpf',
            'birthdate',
            'address',
            'city',
            'housing_type',
            'has_yard',
            'has_screens',
            'other_pets',
            'hours_alone',
            'preferences',
            'initials',
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['name'] = instance.user.get_full_name() or instance.user.first_name or ''
        return data

    def get_initials(self, obj):
        name = obj.user.get_full_name() or obj.user.first_name or obj.user.email
        parts = [p for p in name.split() if p]
        return ''.join(p[0].upper() for p in parts[:2]) or 'AD'

    def validate_cpf(self, value):
        value = (value or '').strip()
        if not value:
            return ''
        if not is_valid_cpf(value):
            raise serializers.ValidationError('CPF inválido.')
        return normalize_cpf(value)

    def update(self, instance, validated_data):
        name = validated_data.pop('name', None)
        user_data = validated_data.pop('user', {})
        user = instance.user
        if name is not None:
            user.first_name = name.strip()
            user.last_name = ''
        if 'phone' in user_data:
            user.phone = user_data['phone']
        if name is not None or 'phone' in user_data:
            user.save(update_fields=['first_name', 'last_name', 'phone'])
        return super().update(instance, validated_data)


class DiscoverAnimalListSerializer(AnimalListSerializer):
    age_months = serializers.IntegerField(read_only=True)

    class Meta(AnimalListSerializer.Meta):
        fields = AnimalListSerializer.Meta.fields + ['age_months']


class DiscoverAnimalDetailSerializer(serializers.ModelSerializer):
    media = AnimalMediaSerializer(many=True, read_only=True)
    shelter_name = serializers.CharField(source='shelter.name', read_only=True)
    shelter_id = serializers.IntegerField(source='shelter.id', read_only=True)
    cover_photo_url = serializers.SerializerMethodField()
    has_active_request = serializers.SerializerMethodField()
    city = serializers.CharField(source='display_city', read_only=True)

    class Meta:
        model = Animal
        fields = [
            'id', 'name', 'species', 'breed', 'sex', 'age_text', 'age_months', 'weight',
            'size', 'status', 'description', 'vaccinated', 'neutered', 'city',
            'is_active', 'media', 'shelter_name', 'shelter_id', 'cover_photo_url',
            'has_active_request', 'created_at', 'updated_at',
        ]

    def get_cover_photo_url(self, obj):
        cover = obj.media.filter(is_cover=True, media_type=AnimalMedia.MediaType.PHOTO).first()
        if cover and cover.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(cover.file.url)
            return cover.file.url
        return None

    def get_has_active_request(self, obj):
        return bool(self.context.get('has_active_request'))


class PublicShelterSerializer(serializers.ModelSerializer):
    cover_photo_url = serializers.SerializerMethodField()
    profile_photo_url = serializers.SerializerMethodField()
    initials = serializers.SerializerMethodField()
    animals = serializers.SerializerMethodField()

    class Meta:
        model = ShelterProfile
        fields = [
            'id',
            'name',
            'about',
            'public_email',
            'public_phone',
            'website',
            'city',
            'is_verified',
            'cover_photo_url',
            'profile_photo_url',
            'initials',
            'animals',
        ]

    def _absolute_url(self, file_field):
        if not file_field:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(file_field.url)
        return file_field.url

    def get_cover_photo_url(self, obj):
        return self._absolute_url(obj.cover_photo)

    def get_profile_photo_url(self, obj):
        return self._absolute_url(obj.profile_photo)

    def get_initials(self, obj):
        parts = [p for p in obj.name.split() if p]
        return ''.join(p[0].upper() for p in parts[:2]) or 'AB'

    def get_animals(self, obj):
        qs = (
            obj.animals
            .filter(is_active=True, status=Animal.Status.AVAILABLE)
            .prefetch_related('media')
        )
        return DiscoverAnimalListSerializer(qs, many=True, context=self.context).data
