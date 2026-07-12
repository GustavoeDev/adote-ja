from rest_framework import status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsShelter
from animals.models import Animal, AnimalMedia
from animals.serializers import AnimalDetailSerializer, AnimalListSerializer, AnimalWriteSerializer

ALLOWED_IMAGE_TYPES = {'image/jpeg', 'image/png', 'image/webp', 'image/gif'}
ALLOWED_VIDEO_TYPES = {'video/mp4', 'video/webm', 'video/quicktime'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


class AnimalListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsShelter]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get(self, request):
        animals = Animal.objects.filter(
            shelter=request.user.shelter_profile,
            is_active=True,
        )
        species = request.query_params.get('species')
        if species:
            animals = animals.filter(species=species)
        return Response(AnimalListSerializer(animals, many=True, context={'request': request}).data)

    def post(self, request):
        serializer = AnimalWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profile = request.user.shelter_profile
        animal = serializer.save(
            shelter=profile,
            city=serializer.validated_data.get('city') or profile.city,
        )
        return Response(
            AnimalDetailSerializer(animal, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


class AnimalDetailView(APIView):
    permission_classes = [IsAuthenticated, IsShelter]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_object(self, request, pk):
        return Animal.objects.get(pk=pk, shelter=request.user.shelter_profile)

    def get(self, request, pk):
        try:
            animal = self.get_object(request, pk)
        except Animal.DoesNotExist:
            return Response({'detail': 'Animal não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(AnimalDetailSerializer(animal, context={'request': request}).data)

    def patch(self, request, pk):
        try:
            animal = self.get_object(request, pk)
        except Animal.DoesNotExist:
            return Response({'detail': 'Animal não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = AnimalWriteSerializer(animal, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(AnimalDetailSerializer(animal, context={'request': request}).data)


class AnimalInactivateView(APIView):
    permission_classes = [IsAuthenticated, IsShelter]

    def post(self, request, pk):
        try:
            animal = Animal.objects.get(pk=pk, shelter=request.user.shelter_profile)
        except Animal.DoesNotExist:
            return Response({'detail': 'Animal não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        animal.is_active = False
        animal.save(update_fields=['is_active', 'updated_at'])
        return Response({'message': 'Animal inativado.'}, status=status.HTTP_200_OK)


class AnimalMediaView(APIView):
    permission_classes = [IsAuthenticated, IsShelter]
    parser_classes = [MultiPartParser, FormParser]

    def get_animal(self, request, pk):
        return Animal.objects.get(pk=pk, shelter=request.user.shelter_profile)

    def post(self, request, pk):
        try:
            animal = self.get_animal(request, pk)
        except Animal.DoesNotExist:
            return Response({'detail': 'Animal não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        uploaded = request.FILES.getlist('files') or (
            [request.FILES['file']] if request.FILES.get('file') else []
        )
        if not uploaded:
            return Response({'detail': 'Nenhum arquivo enviado.'}, status=status.HTTP_400_BAD_REQUEST)

        created = []
        has_cover = animal.media.filter(is_cover=True).exists()
        base_order = animal.media.count()

        for i, f in enumerate(uploaded):
            if f.size > MAX_FILE_SIZE:
                return Response(
                    {'detail': f'Arquivo "{f.name}" excede o limite de 10MB.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            content_type = f.content_type or ''
            if content_type in ALLOWED_IMAGE_TYPES:
                media_type = AnimalMedia.MediaType.PHOTO
            elif content_type in ALLOWED_VIDEO_TYPES:
                media_type = AnimalMedia.MediaType.VIDEO
            else:
                return Response(
                    {'detail': f'Tipo de arquivo não suportado: {content_type or f.name}'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            make_cover = not has_cover and i == 0 and media_type == AnimalMedia.MediaType.PHOTO
            media = AnimalMedia.objects.create(
                animal=animal,
                file=f,
                media_type=media_type,
                is_cover=make_cover,
                order=base_order + i,
            )
            if make_cover:
                has_cover = True
            created.append(media)

        animal.refresh_from_db()
        return Response(
            AnimalDetailSerializer(animal, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


class AnimalMediaDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsShelter]

    def delete(self, request, pk, media_id):
        try:
            animal = Animal.objects.get(pk=pk, shelter=request.user.shelter_profile)
            media = AnimalMedia.objects.get(pk=media_id, animal=animal)
        except (Animal.DoesNotExist, AnimalMedia.DoesNotExist):
            return Response({'detail': 'Mídia não encontrada.'}, status=status.HTTP_404_NOT_FOUND)

        was_cover = media.is_cover
        media.file.delete(save=False)
        media.delete()

        if was_cover:
            first_photo = animal.media.filter(media_type=AnimalMedia.MediaType.PHOTO).first()
            first = first_photo or animal.media.first()
            if first:
                first.is_cover = True
                first.save(update_fields=['is_cover'])

        return Response(AnimalDetailSerializer(animal, context={'request': request}).data)


class AnimalMediaCoverView(APIView):
    permission_classes = [IsAuthenticated, IsShelter]

    def post(self, request, pk, media_id):
        try:
            animal = Animal.objects.get(pk=pk, shelter=request.user.shelter_profile)
            media = AnimalMedia.objects.get(pk=media_id, animal=animal)
        except (Animal.DoesNotExist, AnimalMedia.DoesNotExist):
            return Response({'detail': 'Mídia não encontrada.'}, status=status.HTTP_404_NOT_FOUND)

        if media.media_type != AnimalMedia.MediaType.PHOTO:
            return Response(
                {'detail': 'Apenas fotos podem ser definidas como capa.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        animal.media.filter(is_cover=True).update(is_cover=False)
        media.is_cover = True
        media.save(update_fields=['is_cover'])

        return Response(AnimalDetailSerializer(animal, context={'request': request}).data)
