from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.password_validation import validate_password
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import serializers, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import ShelterProfile, User


class UserSerializer(serializers.ModelSerializer):
    shelter_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'role', 'phone', 'shelter_name']
        read_only_fields = fields

    def get_shelter_name(self, obj):
        if obj.role == User.Role.SHELTER and hasattr(obj, 'shelter_profile'):
            return obj.shelter_profile.name
        return None


class RegisterSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=User.Role.choices)
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20)
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Este e-mail já está cadastrado.')
        return value.lower()

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        role = validated_data['role']
        email = validated_data['email']
        user = User.objects.create_user(
            username=email,
            email=email,
            password=validated_data['password'],
            role=role,
            phone=validated_data['phone'],
            first_name=validated_data['name'],
        )
        if role == User.Role.SHELTER:
            ShelterProfile.objects.create(user=user, name=validated_data['name'])
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {'message': 'Conta criada com sucesso.', 'user': UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].lower()
        password = serializer.validated_data['password']
        user = authenticate(request, username=email, password=password)
        if user is None:
            return Response(
                {'detail': 'E-mail ou senha incorretos.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        login(request, user)
        return Response({'user': UserSerializer(user).data})


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({'message': 'Logout realizado.'})


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class CsrfView(APIView):
    permission_classes = [AllowAny]

    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        return Response({'detail': 'CSRF cookie set'})
