import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TableModule } from 'primeng/table';

interface ComprasCliente {
  id: number;
  cliente: string;
  fechaVenta: string;
  total: number;
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

  compras: ComprasCliente[] = [
            { id: 1, cliente: "Juan", fechaVenta: "12/3/5", total: 2 },
            { id: 1, cliente: "Ana", fechaVenta: "13/8/98", total: 0 }
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
