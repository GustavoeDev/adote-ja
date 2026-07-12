from rest_framework import serializers

from animals.models import Animal


class AnimalListSerializer(serializers.ModelSerializer):
    cover_photo_url = serializers.SerializerMethodField()
    shelter_name = serializers.CharField(source='shelter.name', read_only=True)

    class Meta:
        model = Animal
        fields = [
            'id', 'name', 'species', 'breed', 'age_text', 'weight', 'size',
            'status', 'cover_photo_url', 'shelter_name', 'city', 'is_active',
        ]

    def get_cover_photo_url(self, obj):
        cover = obj.media.filter(is_cover=True).first() or obj.media.first()
        if cover and cover.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(cover.file.url)
            return cover.file.url
        return None
