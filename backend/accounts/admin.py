from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from accounts.models import AdopterProfile, ShelterProfile, User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['email', 'role', 'phone', 'is_active']
    list_filter = ['role', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('AdoteJá', {'fields': ('role', 'phone')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('AdoteJá', {'fields': ('role', 'phone')}),
    )


@admin.register(ShelterProfile)
class ShelterProfileAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'is_verified', 'user']
    search_fields = ['name', 'city']


@admin.register(AdopterProfile)
class AdopterProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'city', 'housing_type', 'updated_at']
    search_fields = ['user__email', 'user__first_name', 'city']
