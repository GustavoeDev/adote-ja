from django.contrib import admin

from animals.models import Animal, AnimalMedia


class AnimalMediaInline(admin.TabularInline):
    model = AnimalMedia
    extra = 0


@admin.register(Animal)
class AnimalAdmin(admin.ModelAdmin):
    list_display = ['name', 'species', 'sex', 'status', 'shelter', 'is_active']
    list_filter = ['species', 'sex', 'status', 'is_active']
    search_fields = ['name', 'breed']
    inlines = [AnimalMediaInline]
