from django.db import migrations, models


def rabbit_to_other(apps, schema_editor):
    Animal = apps.get_model('animals', 'Animal')
    Animal.objects.filter(species='rabbit').update(species='other')


def other_to_rabbit_noop(apps, schema_editor):
    # Irreversível de forma segura: não restaura coelhos.
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('animals', '0002_animal_sex'),
    ]

    operations = [
        migrations.RunPython(rabbit_to_other, other_to_rabbit_noop),
        migrations.AlterField(
            model_name='animal',
            name='species',
            field=models.CharField(
                choices=[('dog', 'Cão'), ('cat', 'Gato'), ('other', 'Outro')],
                max_length=20,
            ),
        ),
    ]
