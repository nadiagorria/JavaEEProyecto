import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ClientesCreditoComponent } from './clientes-credito/clientes-credito.component'


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ClientesCreditoComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'frontend';
}
