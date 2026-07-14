from rest_framework import serializers

from animals.models import Animal, AnimalMedia


class AnimalMediaSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = AnimalMedia
        fields = ['id', 'file_url', 'media_type', 'is_cover', 'order']
        read_only_fields = fields

    def get_file_url(self, obj):
        if not obj.file:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url


class AnimalListSerializer(serializers.ModelSerializer):
    cover_photo_url = serializers.SerializerMethodField()
    shelter_name = serializers.CharField(source='shelter.name', read_only=True)
    city = serializers.CharField(source='display_city', read_only=True)

    class Meta:
        model = Animal
        fields = [
            'id', 'name', 'species', 'breed', 'sex', 'age_text', 'weight', 'size',
            'status', 'cover_photo_url', 'shelter_name', 'city', 'is_active',
        ]

    def get_cover_photo_url(self, obj):
        cover = obj.media.filter(is_cover=True, media_type=AnimalMedia.MediaType.PHOTO).first()
        if cover and cover.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(cover.file.url)
            return cover.file.url
        return None


class AnimalDetailSerializer(serializers.ModelSerializer):
    media = AnimalMediaSerializer(many=True, read_only=True)
    shelter_name = serializers.CharField(source='shelter.name', read_only=True)
    city = serializers.CharField(source='display_city', read_only=True)

    class Meta:
        model = Animal
        fields = [
            'id', 'name', 'species', 'breed', 'sex', 'age_text', 'age_months', 'weight',
            'size', 'status', 'description', 'vaccinated', 'neutered', 'city',
            'is_active', 'media', 'shelter_name', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'media', 'shelter_name', 'city']


class AnimalWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Animal
        fields = [
            'name', 'species', 'breed', 'sex', 'age_text', 'age_months', 'weight',
            'size', 'description', 'vaccinated', 'neutered', 'city', 'status',
        ]

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Nome é obrigatório.')
        return value.strip()

    def validate_species(self, value):
        if value not in Animal.Species.values:
            raise serializers.ValidationError('Espécie inválida.')
        return value
