import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-cliente-perfil',
  imports: [HeaderComponent, FooterComponent, ButtonModule],
  templateUrl: './cliente-perfil.component.html',
  styleUrl: './cliente-perfil.component.scss'
})
export class ClientePerfilComponent {
  nombre:string = "Hola";
  telefono:string = "09983982";

  pago:number = 200;

}
