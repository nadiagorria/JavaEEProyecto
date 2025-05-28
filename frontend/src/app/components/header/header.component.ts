import { Component, Input } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { NotificacionesComponent } from '../notificaciones/notificaciones.component';

@Component({
  selector: 'app-header',
  imports: [MenubarModule, ButtonModule, NotificacionesComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private _nombreUsuario = '';

  @Input()
  set nombreUsuario(valor: string) {
    this._nombreUsuario = '@' + valor;
  }

  get nombreUsuario(): string {
    return this._nombreUsuario;
  }
}
