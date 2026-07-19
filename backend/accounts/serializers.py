from rest_framework import serializers

from accounts.models import ShelterProfile


class ShelterProfileSerializer(serializers.ModelSerializer):
    cover_photo_url = serializers.SerializerMethodField()
    profile_photo_url = serializers.SerializerMethodField()
    initials = serializers.SerializerMethodField()

    class Meta:
        model = ShelterProfile
        fields = [
            'id',
            'name',
            'cover_photo',
            'cover_photo_url',
            'profile_photo',
            'profile_photo_url',
            'about',
            'public_email',
            'public_phone',
            'website',
            'city',
            'is_verified',
            'initials',
        ]
        read_only_fields = [
            'id',
            'is_verified',
            'cover_photo_url',
            'profile_photo_url',
            'initials',
        ]
        extra_kwargs = {
            'cover_photo': {'write_only': True, 'required': False},
            'profile_photo': {'write_only': True, 'required': False},
            'website': {'required': False, 'allow_blank': True},
            'public_email': {'required': False, 'allow_blank': True},
            'public_phone': {'required': False, 'allow_blank': True},
            'about': {'required': False, 'allow_blank': True},
            'city': {'required': False, 'allow_blank': True},
        }

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

    def validate_website(self, value):
        if not value:
            return ''
        value = value.strip()
        if value and not value.startswith(('http://', 'https://')):
            value = f'https://{value}'
        return value

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Nome do abrigo é obrigatório.')
        return value.strip()

    def update(self, instance, validated_data):
        profile = super().update(instance, validated_data)
        if 'name' in validated_data:
            user = profile.user
            user.first_name = validated_data['name']
            user.save(update_fields=['first_name'])
        return profile
