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
