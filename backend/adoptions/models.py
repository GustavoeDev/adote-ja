from django.conf import settings
from django.db import models
from django.utils import timezone

from animals.models import Animal


class AdoptionRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pendente'
        APPROVED = 'approved', 'Aprovado'
        REJECTED = 'rejected', 'Recusado'

    animal = models.ForeignKey(
        Animal,
        on_delete=models.CASCADE,
        related_name='adoption_requests',
    )
    adopter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='adoption_requests',
        limit_choices_to={'role': 'adopter'},
    )
    adopter_name = models.CharField(max_length=150)
    adopter_phone = models.CharField(max_length=20, blank=True)
    adopter_email = models.EmailField()
    adopter_city = models.CharField(max_length=100, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    message = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.adopter_name} → {self.animal.name} ({self.status})'

    def build_initial_timeline(self):
        date = self.created_at.strftime('%d/%m/%Y') if self.created_at else timezone.now().strftime('%d/%m/%Y')
        events = [
            ('Solicitação enviada', date, TimelineEvent.StepStatus.DONE),
            ('Em análise pelo abrigo', date, TimelineEvent.StepStatus.CURRENT),
            ('Entrevista agendada', '—', TimelineEvent.StepStatus.PENDING),
            ('Adoção concluída', '—', TimelineEvent.StepStatus.PENDING),
        ]
        TimelineEvent.objects.bulk_create([
            TimelineEvent(
                request=self,
                event=event,
                date_text=date_text,
                status=status,
                order=index,
            )
            for index, (event, date_text, status) in enumerate(events)
        ])

    def mark_approved(self):
        now = timezone.now()
        date = now.strftime('%d/%m/%Y')
        self.status = self.Status.APPROVED
        self.reviewed_at = now
        self.save(update_fields=['status', 'reviewed_at', 'updated_at'])

        self.timeline_events.all().delete()
        TimelineEvent.objects.bulk_create([
            TimelineEvent(
                request=self,
                event=event,
                date_text=date_text,
                status=TimelineEvent.StepStatus.DONE,
                order=index,
            )
            for index, (event, date_text) in enumerate([
                ('Solicitação enviada', self.created_at.strftime('%d/%m/%Y')),
                ('Em análise pelo abrigo', date),
                ('Entrevista realizada', date),
                ('Adoção aprovada!', date),
            ])
        ])

        animal = self.animal
        if animal.status != Animal.Status.ADOPTED:
            animal.status = Animal.Status.IN_PROCESS
            animal.save(update_fields=['status', 'updated_at'])

    def mark_rejected(self):
        now = timezone.now()
        date = now.strftime('%d/%m/%Y')
        self.status = self.Status.REJECTED
        self.reviewed_at = now
        self.save(update_fields=['status', 'reviewed_at', 'updated_at'])

        self.timeline_events.all().delete()
        TimelineEvent.objects.bulk_create([
            TimelineEvent(
                request=self,
                event=event,
                date_text=date_text,
                status=TimelineEvent.StepStatus.DONE,
                order=index,
            )
            for index, (event, date_text) in enumerate([
                ('Solicitação enviada', self.created_at.strftime('%d/%m/%Y')),
                ('Em análise pelo abrigo', date),
                ('Solicitação recusada', date),
            ])
        ])


class TimelineEvent(models.Model):
    class StepStatus(models.TextChoices):
        DONE = 'done', 'Concluído'
        CURRENT = 'current', 'Atual'
        PENDING = 'pending', 'Pendente'

    request = models.ForeignKey(
        AdoptionRequest,
        on_delete=models.CASCADE,
        related_name='timeline_events',
    )
    event = models.CharField(max_length=120)
    date_text = models.CharField(max_length=20, default='—')
    status = models.CharField(max_length=20, choices=StepStatus.choices)
    order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f'{self.event} ({self.status})'
