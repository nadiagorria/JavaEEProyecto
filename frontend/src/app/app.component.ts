import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ClientePerfilComponent } from './cliente-perfil/cliente-perfil.component'


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ClientePerfilComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'frontend';
}
