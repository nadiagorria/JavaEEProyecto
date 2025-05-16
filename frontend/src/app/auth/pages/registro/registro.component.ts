import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputTextModule } from 'primeng/inputtext';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { CheckboxModule } from 'primeng/checkbox';


@Component({
  selector: 'app-registro',
  imports: [
            IftaLabelModule,
            InputTextModule,
            PasswordModule,
            ButtonModule,
            ReactiveFormsModule,
            RouterLink,
            CheckboxModule
            ],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss'
})
export class RegistroComponent {
  formGroup: FormGroup;

  constructor(private fb: FormBuilder) {
    this.formGroup = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      admin: [false]
    });
  }

  onSubmit() {
    if (this.formGroup.valid) {
      const { username, password } = this.formGroup.value;
      console.log('Username:', username);
      console.log('Password:', password);
      console.log('Email:', this.formGroup.value.email);
      console.log('Valor del checkbox:', this.formGroup.value.admin);
      // aca la logica
    }
  }

}
