import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProveedorPerfilComponent } from './proveedor-perfil/proveedor-perfil.component'


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ProveedorPerfilComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'frontend';
}
