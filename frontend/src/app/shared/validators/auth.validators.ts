import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    if (!value) return null;
    if (value.length < 8) return { weakPassword: true };
    return null;
  };
}

export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value as string)?.replace(/\D/g, '') ?? '';
    if (!value) return null;
    if (value.length < 10 || value.length > 11) return { invalidPhone: true };
    return null;
  };
}

export function formatPhone(value: string): string {
  const digits = (value || '').replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function isValidCpf(value: string): boolean {
  const digits = (value || '').replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;

  const checkDigit = (base: string, factor: number): string => {
    let total = 0;
    for (let i = 0; i < base.length; i += 1) {
      total += Number(base[i]) * (factor - i);
    }
    const remainder = (total * 10) % 11;
    return remainder === 10 ? '0' : String(remainder);
  };

  return checkDigit(digits.slice(0, 9), 10) === digits[9] && checkDigit(digits.slice(0, 10), 11) === digits[10];
}

export function formatCpf(value: string): string {
  const digits = (value || '').replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function cpfValidator(options: { required?: boolean } = {}): ValidatorFn {
  const required = options.required !== false;
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value as string) || '';
    if (!value.trim()) {
      return required ? { required: true } : null;
    }
    if (!isValidCpf(value)) return { invalidCpf: true };
    return null;
  };
}

export function extractErrorMessage(error: unknown, fallback = 'Ocorreu um erro. Tente novamente.'): string {
  if (error instanceof HttpErrorResponse) {
    const data = error.error;
    if (typeof data?.detail === 'string') return data.detail;
    if (typeof data === 'object' && data !== null) {
      const firstKey = Object.keys(data)[0];
      const val = data[firstKey];
      if (Array.isArray(val)) return String(val[0]);
      if (typeof val === 'string') return val;
    }
  }
  return fallback;
}
