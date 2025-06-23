import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ContactoService, ContactoDto } from '../../../services/contacto.service';

@Component({
  selector: 'app-contactanos',  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputTextarea,
    FloatLabelModule,
    MessageModule,
    ToastModule,
    CommonModule
  ],
  templateUrl: './contactanos.component.html',
  styleUrl: './contactanos.component.scss',
  providers: [MessageService]
})
export class ContactanosComponent {
  formGroup: FormGroup;
  isSubmitting = false;
  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    private contactoService: ContactoService
  ) {
    this.formGroup = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      mensaje: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit() {
    if (this.formGroup.valid) {
      this.isSubmitting = true;
      
      const formData = this.formGroup.value;
      this.enviarEmail(formData);
    } else {
      this.markFormGroupTouched();
    }
  }
  private enviarEmail(data: any) {
    const contactoDto: ContactoDto = {
      nombre: data.nombre,
      email: data.email,
      mensaje: data.mensaje
    };
    this.contactoService.enviarMensajeContacto(contactoDto).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.messageService.clear();
this.messageService.add({
          severity: 'success',
          summary: 'Mensaje enviado',
          detail: 'Tu mensaje ha sido enviado exitosamente. Te responderemos pronto.'
        });
        this.formGroup.reset();
      },
      error: (error) => {
        this.enviarEmailFallback(data);
      }
    });
  }

  private enviarEmailFallback(data: any) {
    const subject = encodeURIComponent(`Contacto desde la web - ${data.nombre}`);
    const body = encodeURIComponent(
      `Nombre: ${data.nombre}\n` +
      `Email: ${data.email}\n\n` +
      `Mensaje:\n${data.mensaje}`
    );
    
    const mailtoLink = `mailto:nadia.gorria@estudiantes.utec.edu.uy?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
      setTimeout(() => {
      this.isSubmitting = false;
      this.messageService.clear();
this.messageService.add({
        severity: 'success',
        summary: 'Mensaje enviado',
        detail: 'Tu mensaje ha sido enviado exitosamente. Te responderemos pronto.'
      });
      this.formGroup.reset();
    }, 1000);
  }

  private markFormGroupTouched() {
    Object.keys(this.formGroup.controls).forEach(key => {
      const control = this.formGroup.get(key);
      control?.markAsTouched();
    });
  }

  volverInicio() {
    this.router.navigate(['/home']);
  }
}
