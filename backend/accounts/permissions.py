from rest_framework.permissions import BasePermission

from accounts.models import User


class IsShelter(BasePermission):
    message = 'Acesso restrito a abrigos.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.SHELTER
        )


class IsAdopter(BasePermission):
    message = 'Acesso restrito a adotantes.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.ADOPTER
        )
