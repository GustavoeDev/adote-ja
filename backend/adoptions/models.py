import re
from urllib.parse import quote

from django.conf import settings
from django.db import models
from django.utils import timezone

from animals.models import Animal


def whatsapp_digits(phone: str) -> str:
    digits = re.sub(r'\D', '', phone or '')
    if not digits:
        return ''
    if digits.startswith('55'):
        return digits
    if len(digits) >= 10:
        return f'55{digits}'
    return digits


class AdoptionRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pendente'
        IN_PROGRESS = 'in_progress', 'Em andamento'
        APPROVED = 'approved', 'Aprovado'
        REJECTED = 'rejected', 'Recusado'

    class InterviewPhase(models.TextChoices):
        TO_SCHEDULE = 'to_schedule', 'Agendar entrevista'
        SCHEDULED = 'scheduled', 'Entrevista agendada'
        TO_PERFORM = 'to_perform', 'Realizar entrevista'
        DONE = 'done', 'Entrevista realizada'

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
    interview_phase = models.CharField(
        max_length=20,
        choices=InterviewPhase.choices,
        default=InterviewPhase.TO_SCHEDULE,
    )
    interview_completed = models.BooleanField(default=False)
    interview_scheduled_at = models.DateTimeField(null=True, blank=True)
    interview_completed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    message = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.adopter_name} → {self.animal.name} ({self.status})'

    @property
    def can_decide(self) -> bool:
        return self.status == self.Status.IN_PROGRESS and self.interview_completed

    @property
    def whatsapp_url(self) -> str | None:
        digits = whatsapp_digits(self.adopter_phone)
        if not digits:
            return None
        text = (
            f'Olá {self.adopter_name}! Sou do abrigo e gostaria de agendar '
            f'a entrevista para a adoção de {self.animal.name}.'
        )
        return f'https://wa.me/{digits}?text={quote(text)}'

    def _fmt(self, value) -> str:
        if not value:
            return '—'
        return value.strftime('%d/%m/%Y')

    def _replace_timeline(self, events: list[tuple[str, str, str]]):
        self.timeline_events.all().delete()
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

    def sync_timeline(self):
        """
        Sempre 4 passos. O 3º muda de rótulo/cor conforme a fase da entrevista:
        Agendar entrevista (amarelo) → Entrevista agendada (verde) →
        Realizar entrevista (amarelo) → Entrevista realizada (verde).
        """
        created = self._fmt(self.created_at)
        scheduled = self._fmt(self.interview_scheduled_at)
        interviewed = self._fmt(self.interview_completed_at)
        reviewed = self._fmt(self.reviewed_at)
        done = TimelineEvent.StepStatus.DONE
        current = TimelineEvent.StepStatus.CURRENT
        pending = TimelineEvent.StepStatus.PENDING

        if self.status == self.Status.APPROVED:
            interview = ('Entrevista realizada', interviewed or reviewed, done)
            decision = ('Adoção aprovada!', reviewed, done)
        elif self.status == self.Status.REJECTED:
            interview = ('Entrevista realizada', interviewed or reviewed, done)
            decision = ('Solicitação recusada', reviewed, done)
        elif self.interview_phase == self.InterviewPhase.TO_SCHEDULE:
            interview = ('Agendar entrevista', '—', current)
            decision = ('Decisão final', '—', pending)
        elif self.interview_phase == self.InterviewPhase.SCHEDULED:
            interview = ('Entrevista agendada', scheduled, done)
            decision = ('Decisão final', '—', pending)
        elif self.interview_phase == self.InterviewPhase.TO_PERFORM:
            interview = ('Realizar entrevista', scheduled, current)
            decision = ('Decisão final', '—', pending)
        else:  # DONE / awaiting decision
            interview = ('Entrevista realizada', interviewed, done)
            decision = ('Decisão final', '—', current)

        self._replace_timeline([
            ('Solicitação enviada', created, done),
            ('Análise dos dados', created, done),
            interview,
            decision,
        ])

    def build_initial_timeline(self):
        self.interview_phase = self.InterviewPhase.TO_SCHEDULE
        self.sync_timeline()

    def mark_interview_scheduled(self):
        if self.status != self.Status.PENDING:
            raise ValueError('Somente solicitações pendentes podem agendar entrevista.')

        now = timezone.now()
        self.status = self.Status.IN_PROGRESS
        self.interview_completed = False
        self.interview_phase = self.InterviewPhase.SCHEDULED
        self.interview_scheduled_at = now
        self.save(update_fields=[
            'status',
            'interview_completed',
            'interview_phase',
            'interview_scheduled_at',
            'updated_at',
        ])
        self.sync_timeline()

        animal = self.animal
        if animal.status == Animal.Status.AVAILABLE:
            animal.status = Animal.Status.IN_PROCESS
            animal.save(update_fields=['status', 'updated_at'])

    def advance_to_perform_interview(self):
        """Após 'Entrevista agendada' (verde), avança para 'Realizar entrevista' (amarelo)."""
        if self.status != self.Status.IN_PROGRESS:
            raise ValueError('A solicitação precisa estar em andamento.')
        if self.interview_phase != self.InterviewPhase.SCHEDULED:
            raise ValueError('A entrevista ainda não foi agendada.')

        self.interview_phase = self.InterviewPhase.TO_PERFORM
        self.save(update_fields=['interview_phase', 'updated_at'])
        self.sync_timeline()

    def mark_interview_completed(self):
        if self.status != self.Status.IN_PROGRESS:
            raise ValueError('A solicitação precisa estar em andamento.')
        if self.interview_phase != self.InterviewPhase.TO_PERFORM:
            raise ValueError('A entrevista precisa estar na fase de realização.')
        if self.interview_completed:
            raise ValueError('A entrevista já foi marcada como realizada.')

        now = timezone.now()
        self.interview_completed = True
        self.interview_completed_at = now
        self.interview_phase = self.InterviewPhase.DONE
        self.save(update_fields=[
            'interview_completed',
            'interview_completed_at',
            'interview_phase',
            'updated_at',
        ])
        self.sync_timeline()

    def mark_approved(self):
        if not self.can_decide:
            raise ValueError('A entrevista precisa ter sido realizada antes de aprovar.')

        now = timezone.now()
        self.status = self.Status.APPROVED
        self.reviewed_at = now
        self.save(update_fields=['status', 'reviewed_at', 'updated_at'])
        self.sync_timeline()

        animal = self.animal
        if animal.status != Animal.Status.ADOPTED:
            animal.status = Animal.Status.IN_PROCESS
            animal.save(update_fields=['status', 'updated_at'])

    def mark_rejected(self, reason: str):
        if not self.can_decide:
            raise ValueError('A entrevista precisa ter sido realizada antes de recusar.')

        reason = (reason or '').strip()
        if not reason:
            raise ValueError('Informe o motivo da rejeição.')
        if len(reason) < 5:
            raise ValueError('O motivo da rejeição deve ter pelo menos 5 caracteres.')

        now = timezone.now()
        self.status = self.Status.REJECTED
        self.rejection_reason = reason
        self.reviewed_at = now
        self.save(update_fields=['status', 'rejection_reason', 'reviewed_at', 'updated_at'])
        self.sync_timeline()


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
