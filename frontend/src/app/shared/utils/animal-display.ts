export type AnimalSex = 'male' | 'female' | '';

export function breedLabel(breed: string | null | undefined): string {
  const value = (breed || '').trim();
  if (!value || /^srd$/i.test(value)) {
    return 'Sem raça';
  }
  return value;
}

export function sexLabel(sex: string | null | undefined): string {
  const map: Record<string, string> = {
    male: 'Macho',
    female: 'Fêmea',
  };
  return map[(sex || '').trim()] || '—';
}

export function breedSexLine(
  breed: string | null | undefined,
  sex: string | null | undefined,
): string {
  return `${breedLabel(breed)} • ${sexLabel(sex)}`;
}
