import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { passwordComplexityValidator, passwordsMatchValidator } from '../../utils/password.validators';

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  imports: [CommonModule, RouterModule, ReactiveFormsModule] // Заменили FormsModule на ReactiveFormsModule
})
export class SignupComponent {
  signupForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, passwordComplexityValidator()]],
      repeatPassword: ['', Validators.required]
    }, {
      validators: passwordsMatchValidator('password', 'repeatPassword')
    });
  }

  get f() { return this.signupForm.controls; }

  signup() {
    this.error = null;
    if (this.signupForm.invalid) {
      // Помечаем все поля как 'touched', чтобы отобразить ошибки
      this.signupForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { email, password } = this.signupForm.value;

    this.auth.signup(email, password).subscribe({
      next: res => {
        this.loading = false;
        if (res.success) {
          this.router.navigate(['/profile']);
        } else {
          this.error = (res as any).message || 'Signup failed';
        }
      },
      error: err => {
        this.loading = false;
        // Firebase ошибки часто приходят в виде объекта с кодом и сообщением
        this.error = err.message || 'Server error';
      }
    });
  }
}
