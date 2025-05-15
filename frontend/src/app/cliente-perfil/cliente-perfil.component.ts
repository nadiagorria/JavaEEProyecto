import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TableModule } from 'primeng/table';

interface ClienteCredito {
  id: number;
  nombre: string;
  telefono: string;
  min: number;
  max: number;
  deuda: number;
  pago: number;
}

@Component({
  selector: 'app-cliente-perfil',
  imports: [HeaderComponent, FooterComponent, ButtonModule, InputGroupModule, InputGroupAddonModule, TableModule],
  templateUrl: './cliente-perfil.component.html',
  styleUrl: './cliente-perfil.component.scss'
})
export class ClientePerfilComponent {
  nombre:string = "Hola";
  telefono:string = "09983982";

  pago:number = 200;

  clientes: ClienteCredito[] = [
        { id: 1, nombre: "Juan", telefono: "1231314", min: 2, max: 600, deuda: 2000, pago: 1600 },
        { id: 2, nombre: "Ana", telefono: "9876543", min: 5, max: 400, deuda: 1000, pago: 700 }
  ];

  currentPage: number = 1;
  totalPages: number = 5;
  totalRecords: number = 2;
  currentRange: number = 0;

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

}
