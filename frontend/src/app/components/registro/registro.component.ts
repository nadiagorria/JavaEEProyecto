import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputTextModule } from 'primeng/inputtext';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { RouterLink, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { SecurityService } from '../../../services/security.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-registro',
  imports: [
    IftaLabelModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    ReactiveFormsModule,
    RouterLink,
    CommonModule,
    ToastModule,
  ],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss',
  providers: [MessageService],
})
export class RegistroComponent {
  @ViewChild('confirmPasswordInput') confirmPasswordInput!: ElementRef;
  
  formGroup: FormGroup;
  isLoading = false;
  usernameExists = false;
  isCheckingUsername = false;
  emailExists = false;
  isCheckingEmail = false;
  confirmPasswordFocused = false;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private securityService: SecurityService,
    private renderer: Renderer2
  ) {
    this.formGroup = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );

    this.setupUsernameValidation();

    this.setupEmailValidation();
  }
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else if (confirmPassword?.hasError('passwordMismatch')) {
      const errors = confirmPassword.errors;
      delete errors?.['passwordMismatch'];
      confirmPassword.setErrors(Object.keys(errors || {}).length === 0 ? null : errors);
    }

    return null;
  }

  isValidEmail(): boolean {
    const emailControl = this.formGroup.get('email');
    return emailControl?.valid || false;
  }

  passwordsMatch(): boolean {
    const password = this.formGroup.get('password')?.value;
    const confirmPassword = this.formGroup.get('confirmPassword')?.value;
    return password === confirmPassword;
  }  // Nuevos métodos para manejar el focus
  onConfirmPasswordFocus(): void {
    this.confirmPasswordFocused = true;
    setTimeout(() => {
      const passwordInput = document.querySelector('.p-password');
      if (passwordInput) {
        this.renderer.removeClass(passwordInput, 'valid');
        if (!this.passwordsMatch() && this.formGroup.get('confirmPassword')?.value) {
          this.renderer.addClass(passwordInput, 'invalid');
        }
      }
    }, 0);
  }
  onConfirmPasswordBlur(): void {
    this.confirmPasswordFocused = false;
    
    setTimeout(() => {
      const passwordInput = document.querySelector('.p-password');
      if (passwordInput) {
        if (this.isConfirmPasswordInvalid()) {
          this.renderer.addClass(passwordInput, 'invalid');
        } else {
          this.renderer.removeClass(passwordInput, 'invalid');
        }
        this.renderer.removeClass(passwordInput, 'valid');
      }
    }, 0);
  }

  isConfirmPasswordInvalid(): boolean {
    const confirmPasswordControl = this.formGroup.get('confirmPassword');
    const isTouched = confirmPasswordControl?.touched || false;
    const hasValue = confirmPasswordControl?.value && confirmPasswordControl.value.length > 0;
    const hasAngularErrors = confirmPasswordControl?.invalid || false;
    const passwordsDontMatch = !this.passwordsMatch();
    
    return isTouched && hasValue && (hasAngularErrors || passwordsDontMatch);
  }

  isConfirmPasswordValid(): boolean {
    const confirmPasswordControl = this.formGroup.get('confirmPassword');
    const isTouched = confirmPasswordControl?.touched || false;
    const hasValue = confirmPasswordControl?.value && confirmPasswordControl.value.length > 0;
    const hasNoAngularErrors = confirmPasswordControl?.valid || false;
    const passwordsDoMatch = this.passwordsMatch();
    
    return isTouched && hasValue && hasNoAngularErrors && passwordsDoMatch;
  }

  private setupUsernameValidation() {
    this.formGroup
      .get('username')
      ?.valueChanges.pipe(
        debounceTime(500), // Esperar 500ms después de que el usuario deje de escribir
        distinctUntilChanged(), // Solo verificar si el valor cambió
        switchMap((username) => {
          if (username && username.length >= 3) {
            this.isCheckingUsername = true;
            return this.securityService.checkUsername(username);
          } else {
            this.usernameExists = false;
            this.isCheckingUsername = false;
            return of(null);
          }
        })
      )
      .subscribe({
        next: (response) => {
          this.isCheckingUsername = false;
          if (response) {
            try {
              const data =
                typeof response === 'string' ? JSON.parse(response) : response;
              this.usernameExists = data.existe === true;
            } catch (e) {
              this.usernameExists = false;
            }
          }
        },
        error: (error) => {
          this.isCheckingUsername = false;
          this.usernameExists = false;
          console.error('Error verificando username:', error);
        },
      });
  }

  private setupEmailValidation() {
    this.formGroup
      .get('email')
      ?.valueChanges.pipe(
        debounceTime(500), // Esperar 500ms después de que el usuario deje de escribir
        distinctUntilChanged(), // Solo verificar si el valor cambió
        switchMap((email) => {
          if (email && this.isValidEmail()) {
            this.isCheckingEmail = true;
            return this.securityService.checkEmail(email);
          } else {
            this.emailExists = false;
            this.isCheckingEmail = false;
            return of(null);
          }
        })
      )
      .subscribe({
        next: (response) => {
          this.isCheckingEmail = false;
          if (response) {
            try {
              const data =
                typeof response === 'string' ? JSON.parse(response) : response;
              this.emailExists = data.existe === true;
            } catch (e) {
              this.emailExists = false;
            }
          }
        },
        error: (error) => {
          this.isCheckingEmail = false;
          this.emailExists = false;
          console.error('Error verificando email:', error);
        },
      });
  }
  onSubmit() {
    if (
      this.formGroup.valid &&
      !this.isLoading &&
      !this.usernameExists &&
      !this.emailExists &&
      !this.isCheckingUsername &&
      !this.isCheckingEmail
    ) {
      this.isLoading = true;
      const { username, email, password } = this.formGroup.value;

      this.securityService
        .register(username, email, password, false)
        .subscribe({
          next: (response) => {
            this.isLoading = false;

            this.messageService.add({
              severity: 'success',
              summary: 'Registro Exitoso',
              detail: `¡Bienvenido ${username}! Tu cuenta ha sido creada correctamente`,
              life: 4000,
            });

            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error en registro:', error);

            let mensaje = 'Error al intentar registrar usuario';
            let severidad = 'error';

            if (error.error) {
              try {
                const errorData =
                  typeof error.error === 'string'
                    ? JSON.parse(error.error)
                    : error.error;

                switch (errorData.error) {
                  case 'CONTRASENIA_CORTA':
                    mensaje = 'La contraseña debe tener al menos 6 caracteres';
                    break;
                  case 'USUARIO_EXISTENTE':
                    mensaje = 'El nombre de usuario ya está en uso';
                    break;
                  case 'EMAIL_EXISTENTE':
                    mensaje =
                      'El email ya está registrado con otro usuario activo';
                    break;
                  case 'EMAIL_INVALIDO':
                    mensaje = 'El email proporcionado no es válido';
                    break;
                  case 'NOMBRE_CORTO':
                    mensaje =
                      'El nombre de usuario debe tener al menos 3 caracteres';
                    break;
                  case 'ERROR_SERVIDOR':
                    mensaje = 'Error interno del servidor. Intente nuevamente.';
                    break;
                  default:
                    mensaje = errorData.message || mensaje;
                    break;
                }
              } catch (e) {
                mensaje = error.error?.message || mensaje;
              }
            }

            this.messageService.add({
              severity: severidad,
              summary: 'Error de Registro',
              detail: mensaje,
              life: 4000,
            });

            if (error.error?.error === 'USUARIO_EXISTENTE') {
              this.formGroup.get('username')?.setValue('');
            }
            if (error.error?.error === 'EMAIL_EXISTENTE') {
              this.formGroup.get('email')?.setValue('');
            }
          },
        });
    } else {
      this.formGroup.markAllAsTouched();
      let mensajeError = 'Por favor completa todos los campos correctamente';

      if (this.usernameExists) {
        mensajeError = 'El nombre de usuario ya está en uso';
      } else if (this.isCheckingUsername) {
        mensajeError = 'Esperando verificación del nombre de usuario';
      } else if (this.emailExists) {
        mensajeError = 'El email ya está registrado';
      } else if (this.isCheckingEmail) {
        mensajeError = 'Esperando verificación del email';
      }

      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: mensajeError,
        life: 3000,
      });
    }
  }
}
