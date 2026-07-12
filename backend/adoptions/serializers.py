from rest_framework import serializers

from adoptions.models import AdoptionRequest, TimelineEvent


class TimelineEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimelineEvent
        fields = ('event', 'date_text', 'status', 'order')


class AdoptionRequestSerializer(serializers.ModelSerializer):
    animal_id = serializers.IntegerField(source='animal.id', read_only=True)
    animal_name = serializers.CharField(source='animal.name', read_only=True)
    animal_photo_url = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    timeline = TimelineEventSerializer(source='timeline_events', many=True, read_only=True)
    can_decide = serializers.BooleanField(read_only=True)
    whatsapp_url = serializers.CharField(read_only=True, allow_null=True)

    class Meta:
        model = AdoptionRequest
        fields = (
            'id',
            'animal_id',
            'animal_name',
            'animal_photo_url',
            'status',
            'interview_phase',
            'interview_completed',
            'can_decide',
            'whatsapp_url',
            'date',
            'adopter_name',
            'adopter_phone',
            'adopter_email',
            'adopter_city',
            'message',
            'rejection_reason',
            'timeline',
            'created_at',
            'reviewed_at',
        )

    def get_animal_photo_url(self, obj):
        cover = obj.animal.media.filter(is_cover=True).first()
        if not cover:
            cover = obj.animal.media.filter(media_type='photo').first()
        if not cover:
            return None
        request = self.context.get('request')
        url = cover.file.url
        return request.build_absolute_uri(url) if request else url

    def get_date(self, obj):
        return obj.created_at.strftime('%d/%m/%Y')
