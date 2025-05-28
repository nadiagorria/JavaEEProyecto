import { Component, Input, OnInit } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { NotificacionesComponent } from '../notificaciones/notificaciones.component';
import { SecurityService } from '../../../services/security.service';

@Component({
  selector: 'app-header',
  imports: [MenubarModule, ButtonModule, NotificacionesComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  private _nombreUsuario = '';

  constructor(private securityService: SecurityService) {}

  ngOnInit() {
    this.cargarUsuarioActual();
  }

  @Input()
  set nombreUsuario(valor: string) {
    this._nombreUsuario = '@' + valor;
  }

  get nombreUsuario(): string {
    return this._nombreUsuario;
  }
  private cargarUsuarioActual() {
    if (this.securityService.isLoggedIn()) {
      const nombreUsuario = this.securityService.getUserName();
      if (nombreUsuario) {
        this._nombreUsuario = '@' + nombreUsuario;
      } else {
        this._nombreUsuario = '@Usuario';
      }
    } else {
      this._nombreUsuario = '@Invitado';
    }
  }
}
