import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';

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
  selector: 'app-clientes-credito',
  imports: [HeaderComponent,
    FooterComponent,
    InputGroupModule,
    InputGroupAddonModule,
    ButtonModule,
    MenuModule,
    TableModule,
    DialogModule,
    ],
  templateUrl: './clientes-credito.component.html',
  styleUrl: './clientes-credito.component.scss'
})

export class ClientesCreditoComponent {
  clientes: ClienteCredito[] = [
      { id: 1, nombre: "Juan", telefono: "1231314", min: 2, max: 600, deuda: 2000, pago: 1600 },
      { id: 2, nombre: "Ana", telefono: "9876543", min: 5, max: 400, deuda: 1000, pago: 700 }
    ];

  visible: boolean = false;
  nombre: string = '';
  telefono: string = '';

  mostarModal(){
    this.visible = true;
  }

  saveCliente(){
    // Lógica para guardar el cliente
    console.log(`Nombre: ${this.nombre}, Teléfono: ${this.telefono}`);
    this.visible = false;  // Cerrar el diálogo después de guardar
  }

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
