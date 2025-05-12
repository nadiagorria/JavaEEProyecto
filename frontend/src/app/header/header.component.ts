import { Component, Input } from '@angular/core';
import { NgModule } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ListboxModule } from 'primeng/listbox';
import { ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormControl } from '@angular/forms';


@Component({
  selector: 'app-header',
  imports: [MenubarModule, DialogModule, ButtonModule, ListboxModule, ReactiveFormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
  })

export class HeaderComponent {
  formGroup: FormGroup;

  mensajes = [
    { name: 'Mensaje1', value: 'M1' , content: 'Hola buena talde'},
    { name: 'Rome', value: 'RM', content: ' ñeri' },
    { name: 'London', value: 'LDN', content: 'Hola  talde' },
    { name: 'Istanbul', value: 'IST', content: ' buena talde' },
    { name: 'Paris', value: 'PRS',content: '  talde' }
  ];

  constructor() {
    this.formGroup = new FormGroup({
      selectedMensaje: new FormControl(null)
    });
  }

  private _nombreUsuario = '';

  @Input()
    set nombreUsuario(valor: string) {
      this._nombreUsuario = '@' + valor;
    }

    get nombreUsuario(): string {
      return this._nombreUsuario;
    }

  visible: boolean = false;

  showDialog() {
     this.visible = true;
  }

}
