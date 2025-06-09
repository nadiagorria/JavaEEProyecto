import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputTextModule } from 'primeng/inputtext';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
            ToastModule
            ],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss',
  providers: [MessageService]
})
export class RegistroComponent {
  formGroup: FormGroup;
  isLoading = false;
  usernameExists = false;
  isCheckingUsername = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private securityService: SecurityService
  ) {
    this.formGroup = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Configurar validación en tiempo real para el username
    this.setupUsernameValidation();
  }

  private setupUsernameValidation() {
    this.formGroup.get('username')?.valueChanges.pipe(
      debounceTime(500), // Esperar 500ms después de que el usuario deje de escribir
      distinctUntilChanged(), // Solo verificar si el valor cambió
      switchMap(username => {
        if (username && username.length >= 3) {
          this.isCheckingUsername = true;
          return this.securityService.checkUsername(username);
        } else {
          this.usernameExists = false;
          this.isCheckingUsername = false;
          return of(null);
        }
      })
    ).subscribe({
      next: (response) => {
        this.isCheckingUsername = false;
        if (response) {
          try {
            const data = typeof response === 'string' ? JSON.parse(response) : response;
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
      }
    });
  }
  onSubmit() {
    if (this.formGroup.valid && !this.isLoading && !this.usernameExists) {
      this.isLoading = true;
      const { username, email, password } = this.formGroup.value;
      
      // Always register as CAJERO (admin = false)
      this.securityService.register(username, email, password, false).subscribe({
        next: (response) => {
          this.isLoading = false;
          
          this.messageService.add({
            severity: 'success',
            summary: 'Registro Exitoso',
            detail: `¡Bienvenido ${username}! Tu cuenta ha sido creada correctamente`,
            life: 4000
          });
          
          // Delay navigation to show success message
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error en registro:', error);
          
          let mensaje = 'Error al intentar registrar usuario';
          let severidad = 'error';
          
          // Parse error response
          if (error.error) {
            try {
              const errorData = typeof error.error === 'string' ? JSON.parse(error.error) : error.error;
              
              switch (errorData.error) {
                case 'CONTRASENIA_CORTA':
                  mensaje = 'La contraseña debe tener al menos 6 caracteres';
                  break;
                case 'USUARIO_EXISTENTE':
                  mensaje = 'El nombre de usuario ya está en uso';
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
            life: 4000
          });
          
          // Reset form on certain errors
          if (error.error?.error === 'USUARIO_EXISTENTE') {
            this.formGroup.get('username')?.setValue('');
          }
        }
      });    } else {
      // Mark all fields as touched to show validation errors
      this.formGroup.markAllAsTouched();
      
      let mensajeError = 'Por favor completa todos los campos correctamente';
      
      if (this.usernameExists) {
        mensajeError = 'El nombre de usuario ya está en uso';
      } else if (this.isCheckingUsername) {
        mensajeError = 'Esperando verificación del nombre de usuario';
      }
      
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: mensajeError,
        life: 3000
      });
    }
  }
}
