import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputTextModule } from 'primeng/inputtext';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { SecurityService } from '../../../services/security.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [MessageService]
})


export class LoginComponent {
  formGroup: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private securityService: SecurityService
  ) {
    this.formGroup = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      contrasenia: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  onSubmit() {
    if (this.formGroup.valid && !this.isLoading) {
      this.isLoading = true;
      const { username, contrasenia } = this.formGroup.value;
      
      this.securityService.login(username, contrasenia).subscribe({
        next: (response) => {
          this.isLoading = false;
          
          // Store token
          localStorage.setItem('token', response.token);          // Store user info
          const userStr = JSON.stringify({
            nombreUsuario: response.nombreUsuario,
            roles: response.roles,
            email: response.email // Incluir el email en los datos guardados
          });
          const encryptedUser = this.securityService.convertText('encrypt', userStr);
          localStorage.setItem('USER', encryptedUser);
          
          // Update service user
          this.securityService.user = {
            nombreUsuario: response.nombreUsuario,
            roles: response.roles,
            email: response.email // Incluir el email en el objeto user del servicio
          };

          this.messageService.clear();
          this.messageService.add({
            severity: 'success',
            summary: 'Bienvenido',
            detail: `¡Hola ${response.nombreUsuario}! Has iniciado sesión correctamente`,
            life: 3000
          });
          
          // Delay navigation slightly to show success message
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 1000);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error en login:', error);
          
          let mensaje = 'Error al intentar iniciar sesión';
          let severidad = 'error';
          
          // Verificar si el error tiene información específica
          if (error.error) {
            try {
              const errorData = typeof error.error === 'string' ? JSON.parse(error.error) : error.error;
              
              switch (errorData.error) {
                case 'USUARIO_INCORRECTO':
                  mensaje = 'El nombre de usuario o la contraseña son incorrectos.';
                  break;
                case 'CONTRASENIA_INCORRECTA':
                  mensaje = 'El nombre de usuario o la contraseña son incorrectos.';
                  break;
                case 'ERROR_SERVIDOR':
                  mensaje = 'Error interno del servidor. Intente nuevamente.';
                  break;
                default:
                  mensaje = errorData.message || mensaje;
                  break;
              }
            } catch (e) {
              // Si no se puede parsear el error, usar el mensaje por defecto
              mensaje = error.error?.message || mensaje;
            }
          }
          
          this.messageService.add({
            severity: severidad,
            summary: 'Error de Autenticación',
            detail: mensaje,
            life: 4000
          });
          
          // Reset password field on error
          this.formGroup.get('contrasenia')?.setValue('');
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.formGroup.markAllAsTouched();
      
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Por favor completa todos los campos requeridos',
        life: 3000      });
    }
  }

  irARecuperarPassword() {
    // Forzar recarga completa de la página al navegar a recuperar-password
    window.location.href = '/recuperar-password';
  }
}
