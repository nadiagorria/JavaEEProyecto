import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputTextModule } from 'primeng/inputtext';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { UsuarioDto } from '../../../models/usuario.dto';
import { MessageService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-login',
  imports: [
            IftaLabelModule,
            InputTextModule,
            PasswordModule,
            ButtonModule,
            ReactiveFormsModule,
            RouterLink,
            CommonModule
            ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  //providers: [MessageService]
})


export class LoginComponent {
  formGroup: FormGroup;

  constructor(private fb: FormBuilder //,
    //private http: HttpClient,
    //private router: Router,
    //private messageService: MessageService
  ) {
    this.formGroup = this.fb.group({
      username: ['', Validators.required],
      contrasenia: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.formGroup.valid) {
      const loginData = {
        username: this.formGroup.get('username')?.value,
        contrasenia: this.formGroup.get('contrasenia')?.value
      };

      //aca la llamada a la api
    }
  }
}
