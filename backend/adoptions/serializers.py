from rest_framework import serializers

from adoptions.models import AdoptionRequest, TimelineEvent
from animals.models import Animal


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
            'adopter_cpf',
            'adopter_address',
            'housing_type',
            'has_yard',
            'other_pets',
            'motivation',
            'experience',
            'hours_alone',
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


class AdopterCreateAdoptionRequestSerializer(serializers.Serializer):
    animal_id = serializers.IntegerField()
    adopter_name = serializers.CharField(max_length=150)
    adopter_cpf = serializers.CharField(max_length=20)
    adopter_phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    adopter_email = serializers.EmailField()
    adopter_address = serializers.CharField(max_length=255, required=False, allow_blank=True)
    adopter_city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    housing_type = serializers.CharField(max_length=40, required=False, allow_blank=True)
    has_yard = serializers.CharField(max_length=10, required=False, allow_blank=True)
    other_pets = serializers.CharField(max_length=255, required=False, allow_blank=True)
    motivation = serializers.CharField(required=False, allow_blank=True)
    experience = serializers.CharField(required=False, allow_blank=True)
    hours_alone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    message = serializers.CharField(required=False, allow_blank=True)

    def validate_animal_id(self, value):
        try:
            animal = Animal.objects.get(pk=value, is_active=True)
        except Animal.DoesNotExist as exc:
            raise serializers.ValidationError('Animal não encontrado.') from exc
        if animal.status != Animal.Status.AVAILABLE:
            raise serializers.ValidationError('Este animal não está disponível para adoção.')
        return value

    def validate_adopter_cpf(self, value):
        digits = ''.join(c for c in value if c.isdigit())
        if len(digits) != 11:
            raise serializers.ValidationError('CPF inválido.')
        return value

    def create(self, validated_data):
        request = self.context['request']
        animal = Animal.objects.get(pk=validated_data['animal_id'])
        adopter = request.user

        if AdoptionRequest.objects.filter(
            adopter=adopter,
            animal=animal,
            status__in=[
                AdoptionRequest.Status.PENDING,
                AdoptionRequest.Status.IN_PROGRESS,
            ],
        ).exists():
            raise serializers.ValidationError(
                {'animal_id': 'Você já possui uma solicitação ativa para este animal.'}
            )

        motivation = validated_data.get('motivation', '')
        req = AdoptionRequest.objects.create(
            animal=animal,
            adopter=adopter,
            adopter_name=validated_data['adopter_name'],
            adopter_cpf=validated_data.get('adopter_cpf', ''),
            adopter_phone=validated_data.get('adopter_phone') or adopter.phone,
            adopter_email=validated_data['adopter_email'],
            adopter_address=validated_data.get('adopter_address', ''),
            adopter_city=validated_data.get('adopter_city', ''),
            housing_type=validated_data.get('housing_type', ''),
            has_yard=validated_data.get('has_yard', ''),
            other_pets=validated_data.get('other_pets', ''),
            motivation=motivation,
            experience=validated_data.get('experience', ''),
            hours_alone=validated_data.get('hours_alone', ''),
            message=validated_data.get('message') or motivation,
        )
        req.build_initial_timeline()
        return req
