from django.contrib import admin

from adoptions.models import AdoptionRequest, TimelineEvent


class TimelineEventInline(admin.TabularInline):
    model = TimelineEvent
    extra = 0


@admin.register(AdoptionRequest)
class AdoptionRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'adopter_name', 'animal', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('adopter_name', 'adopter_email', 'animal__name')
    inlines = [TimelineEventInline]
