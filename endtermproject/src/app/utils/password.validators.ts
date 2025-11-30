import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Валидатор для проверки сложности пароля:
 * - Минимум 8 символов
 * - Минимум одна специальный символ
 * - Минимум одна цифра
 */
export function passwordComplexityValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null; // Пустое значение обрабатывается обязательным валидатором (required)
    }

    const hasMinLength = value.length >= 8;
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value);

    const passwordValid = hasMinLength && hasNumber && hasSpecial;

    return !passwordValid ? { passwordComplexity: { 
        requiredLength: 8, 
        hasNumber: hasNumber, 
        hasSpecial: hasSpecial 
    } } : null;
  };
}

/**
 * Валидатор для проверки совпадения пароля и его подтверждения.
 * Должен применяться к FormGroup.
 */
export function passwordsMatchValidator(passwordControlName: string, confirmPasswordControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const passwordControl = control.get(passwordControlName);
    const confirmPasswordControl = control.get(confirmPasswordControlName);

    if (!passwordControl || !confirmPasswordControl) {
      return null;
    }

    // Если пароли совпадают, убираем ошибку, если она была установлена
    if (passwordControl.value === confirmPasswordControl.value) {
      if (confirmPasswordControl.hasError('passwordsMatch')) {
        const errors = { ...confirmPasswordControl.errors };
        delete errors['passwordsMatch'];
        confirmPasswordControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
      return null;
    } else {
      // Если пароли не совпадают, устанавливаем ошибку
      confirmPasswordControl.setErrors({ ...confirmPasswordControl.errors, passwordsMatch: true });
      return { passwordsMatch: true };
    }
  };
}
