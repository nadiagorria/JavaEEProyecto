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
            ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [MessageService]
})


export class LoginComponent {
  formGroup: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private securityService: SecurityService
  ) {
    this.formGroup = this.fb.group({
      username: ['', Validators.required],
      contrasenia: ['', Validators.required]
    });
  }

  onSubmit() {
  if (this.formGroup.valid) {
    const { username, contrasenia } = this.formGroup.value;
    
    this.securityService.login(username, contrasenia).subscribe({
      next: (response) => {
        // Store token
        localStorage.setItem('token', response.token);
        
        // Store user info
        const userStr = JSON.stringify({
          nombreUsuario: response.usuario,
          roles: response.roles
        });
        const encryptedUser = this.securityService.convertText('encrypt', userStr);
        localStorage.setItem('USER', encryptedUser);
        
        // Update service user
        this.securityService.user = {
          nombreUsuario: response.usuario,
          roles: response.roles
        };

        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Login exitoso'
        });
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Error al intentar iniciar sesión'
        });
      }
    });
  }
}
}
