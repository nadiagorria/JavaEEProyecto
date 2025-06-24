import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { IftaLabelModule } from 'primeng/iftalabel';
import { MessageService } from 'primeng/api';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    ToastModule,
    IftaLabelModule,
  ],
  templateUrl: './recuperar-password.component.html',
  styleUrls: ['./recuperar-password.component.scss'],
  providers: [MessageService],
  encapsulation: ViewEncapsulation.None,
})
export class RecuperarPasswordComponent implements OnInit {
  step = 1;
  loading = false;
  componeteReady = false;

  form = {
    email: '',
    codigo: '',
    nuevaPassword: '',
    confirmarPassword: '',
  };

  validandoPassword = false;

  constructor(
    private usuarioService: UsuarioService,
    private messageService: MessageService,
    private router: Router
  ) {}
  ngOnInit() {
    setTimeout(() => {
      this.componeteReady = true;

      setTimeout(() => {
        const buttons = document.querySelectorAll(
          'app-recuperar-password button[pButton]'
        );
        buttons.forEach((button) => {
          (button as HTMLElement).style.cssText +=
            ';display: inline-flex !important;';
        });
      }, 50);
    }, 200);
  }

  isValidEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(email);
  }

  solicitarCodigo() {
    if (!this.form.email || !this.isValidEmail(this.form.email)) {
      this.messageService.clear();
      this.messageService.add({
        severity: 'warn',
        summary: 'Email Inválido',
        detail: 'Por favor ingrese un email válido',
        life: 4000,
      });
      return;
    }

    this.loading = true;
    this.usuarioService
      .solicitarRecuperacionPassword(this.form.email)
      .subscribe({
        next: (response: string) => {
          this.loading = false;
          this.step = 2;
          this.messageService.clear();
          this.messageService.add({
            severity: 'success',
            summary: 'Código Enviado',
            detail: response,
            life: 8000,
          });
        },
        error: (error: any) => {
          this.loading = false;
          this.messageService.clear();
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error || 'Error al solicitar código de recuperación',
            life: 5000,
          });
        },
      });
  }

  restablecerPassword() {
    if (!this.form.codigo || this.form.codigo.length !== 6) {
      this.messageService.clear();
      this.messageService.add({
        severity: 'warn',
        summary: 'Código Inválido',
        detail: 'El código debe tener 6 dígitos',
        life: 4000,
      });
      return;
    }

    if (!this.form.nuevaPassword || this.form.nuevaPassword.length < 6) {
      this.messageService.clear();
      this.messageService.add({
        severity: 'warn',
        summary: 'Contraseña Inválida',
        detail: 'La contraseña debe tener al menos 6 caracteres',
        life: 4000,
      });
      return;
    }

    if (this.form.nuevaPassword !== this.form.confirmarPassword) {
      this.messageService.clear();
      this.messageService.add({
        severity: 'warn',
        summary: 'Contraseñas no Coinciden',
        detail: 'Las contraseñas ingresadas no coinciden',
        life: 4000,
      });
      return;
    }

    this.loading = true;
    this.usuarioService
      .restablecerPassword(
        this.form.email,
        this.form.codigo,
        this.form.nuevaPassword
      )
      .subscribe({
        next: (response: string) => {
          this.loading = false;
          this.messageService.clear();
          this.messageService.add({
            severity: 'success',
            summary: 'Contraseña Restablecida',
            detail: response,
            life: 5000,
          });

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error: any) => {
          this.loading = false;
          let errorMessage =
            error.error || 'Error al restablecer la contraseña';
          if (
            errorMessage.includes(
              'La nueva contraseña no puede ser igual a la actual'
            )
          ) {
            this.messageService.clear();
            this.messageService.add({
              severity: 'warn',
              summary: 'Contraseña Inválida',
              detail: 'La nueva contraseña no puede ser igual a la actual.',
              life: 5000,
            });
          } else {
            this.messageService.clear();
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: errorMessage,
              life: 5000,
            });
          }
        },
      });
  }
  validarPasswordDiferente() {
    if (
      !this.form.nuevaPassword ||
      !this.form.email ||
      this.form.nuevaPassword.length < 6
    ) {
      return;
    }

    if (this.validandoPassword) {
      return;
    }

    this.validandoPassword = true;

    this.usuarioService
      .verificarPasswordActual(this.form.email, this.form.nuevaPassword)
      .subscribe({
        next: (esIgual: boolean) => {
          this.validandoPassword = false;
          if (esIgual) {
            this.messageService.clear();
            this.messageService.add({
              severity: 'warn',
              summary: 'Contraseña Inválida',
              detail: 'La nueva contraseña no puede ser igual a la actual.',
              life: 4000,
            });
            setTimeout(() => {
              this.form.nuevaPassword = '';
              this.form.confirmarPassword = '';
            }, 100);
          }
        },
        error: () => {
          this.validandoPassword = false;
        },
      });
  }

  volver() {
    this.router.navigate(['/login']);
  }

  volverAlPaso1() {
    this.step = 1;
    this.form.codigo = '';
    this.form.nuevaPassword = '';
    this.form.confirmarPassword = '';
  }


  esEmailValido(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  validarEmailEnTiempoReal(): void {
     }

  validarPasswordsEnTiempoReal(): void {
    }

  esFormularioValido(): boolean {
    const codigoValido = this.form.codigo && this.form.codigo.length === 6;
    const passwordValida = this.form.nuevaPassword && this.form.nuevaPassword.length >= 6;
    const passwordsCoinciden = this.form.nuevaPassword === this.form.confirmarPassword;
    const confirmarPasswordCompleto = this.form.confirmarPassword && this.form.confirmarPassword.length > 0;
    
    return !!codigoValido && !!passwordValida && !!passwordsCoinciden && !!confirmarPasswordCompleto;
  }

  forzarBordeNegro(event: any): void {
    setTimeout(() => {
      const passwordInput = event.target.closest('.p-password');
      if (passwordInput) {
        const input = passwordInput.querySelector('input');
        if (input) {
          input.style.setProperty('border-color', '#000000', 'important');
          input.style.setProperty('box-shadow', '0 0 0 3px rgba(0, 0, 0, 0.1)', 'important');
          
          passwordInput.style.setProperty('border-color', '#000000', 'important');
          
          const blurHandler = () => {
            input.style.setProperty('border-color', '#dee2e6', 'important');
            input.style.setProperty('box-shadow', 'none', 'important');
            passwordInput.style.setProperty('border-color', '#dee2e6', 'important');
            input.removeEventListener('blur', blurHandler);
          };
          
          input.addEventListener('blur', blurHandler);
        }
      }
    }, 50);
  }

  forzarBordeNegroInput(event: any): void {
    const input = event.target;
    if (input) {
      input.style.setProperty('border-color', '#000000', 'important');
      input.style.setProperty('box-shadow', '0 0 0 3px rgba(0, 0, 0, 0.1)', 'important');
      
      const blurHandler = () => {
        input.style.setProperty('border-color', '#dee2e6', 'important');
        input.style.setProperty('box-shadow', 'none', 'important');
        input.removeEventListener('blur', blurHandler);
      };
      
      input.addEventListener('blur', blurHandler);
    }
  }
}
