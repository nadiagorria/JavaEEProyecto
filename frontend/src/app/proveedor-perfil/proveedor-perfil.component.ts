import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TableModule } from 'primeng/table';

interface ComprasCliente {
  id: number;
  codigoBarras: string;
  nombre: string;
  stock: number;
}

@Component({
  selector: 'app-proveedor-perfil',
  imports: [HeaderComponent, FooterComponent, ButtonModule, InputGroupModule, InputGroupAddonModule, TableModule],
  templateUrl: './proveedor-perfil.component.html',
  styleUrl: './proveedor-perfil.component.scss'
})
export class ProveedorPerfilComponent {

  nombre:string = "Hola";
  telefono:string = "09983982";
  email:string = "salaberry@gmail.com";


  pago:number = 200;

  productos: ComprasCliente[] = [
    { id: 1, codigoBarras: "4723847238", nombre: "juan", stock: 2 },
    { id: 1, codigoBarras: "4829042070340", nombre: "ana", stock: 0 }
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
