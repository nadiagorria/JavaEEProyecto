import { Component } from '@angular/core';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';



interface Producto {
  id: number;
  nombre: string;
  codigoBarras: string;
  precio: number;
  cantidad: number;
}

interface Cliente {
  id: number;
  nombre: string;
  email?: string;
}

interface VentaRequest {
  productos: Producto[];
  cliente?: Cliente;
  formaPago: 'EFECTIVO' | 'CREDITO' | 'DEBITO' | 'FIADO';
  fecha: string;
}

interface FormaPago {
  label: string;
  value: string;
}


@Component({
  selector: 'app-nuevaventa',
  imports: [
            FormsModule,
            AutoCompleteModule,
            TableModule,
            InputNumberModule,
            ButtonModule,
            CurrencyPipe,
            DialogModule,
            DropdownModule,
            PaginatorModule
            ],
  templateUrl: './nuevaventa.component.html',
  styleUrl: './nuevaventa.component.scss',
  providers:[MessageService]
})
export class NuevaventaComponent {


  productoSeleccionado: any;
  listaProductos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  displayDialog: boolean = false;
  clienteSeleccionado: Cliente | null = null;
  formaPagoSeleccionada: string = '';
  totalRecords: number = 0;
  // Mock de datos

  productos: Producto[] = [
    { id: 1, nombre: 'Laptop', codigoBarras: '123456', precio: 1200, cantidad: 1 },
    { id: 2, nombre: 'Mouse', codigoBarras: '789012', precio: 20, cantidad: 1 },
    { id: 3, nombre: 'Teclado', codigoBarras: '345678', precio: 50, cantidad: 1 },
    { id: 4, nombre: 'Coca cola', codigoBarras: '345687', precio: 60, cantidad: 1 },
    { id: 5, nombre: 'Galletitas', codigoBarras: '876543', precio: 20, cantidad: 1 },
    { id: 6, nombre: 'Colet', codigoBarras: '2456789', precio: 40, cantidad: 1 }

  ];



  // Filtra productos al escribir en la barra
filtrarProductos(event: any) {
  const query = event.query.toLowerCase();

  // coincidencias exactas en códigos
  const matchesExactos = this.productos.filter(
    producto => producto.codigoBarras.toLowerCase() === query
  );

  if (matchesExactos.length > 0) {
    this.productosFiltrados = matchesExactos;
    return;
  }

  //busca por inicio de código o nombre
  this.productosFiltrados = this.productos.filter(
    producto =>
      producto.codigoBarras.toLowerCase().startsWith(query) ||
      producto.nombre.toLowerCase().includes(query)
  );
}

  agregarALista(event: AutoCompleteSelectEvent) {
    const productoSeleccionado: Producto = event.value;
    if (!this.listaProductos.some(p => p.id === productoSeleccionado.id)) {
      this.listaProductos.push({
        ...productoSeleccionado,
        cantidad: 1
      });
    this.totalRecords = this.totalRecords + 1;
    }
    this.productoSeleccionado = null;
  }

  // Elimina un producto de la lista
  eliminarProducto(producto: Producto) {
    this.listaProductos = this.listaProductos.filter(p => p.id !== producto.id);
  }


  clientes: Cliente[] = [
    { id: 1, nombre: 'Cliente 1', email: 'cliente1@example.com' },
    { id: 2, nombre: 'Cliente 2', email: 'cliente2@example.com' },
    { id: 3, nombre: 'Mostrador' }
  ];

  formasPago: FormaPago[] = [
    { label: 'Efectivo', value: 'EFECTIVO' },
    { label: 'Crédito', value: 'CREDITO' },
    { label: 'Débito', value: 'DEBITO' },
    { label: 'Fiado', value: 'FIADO' }
  ];

abrirDialogoFinalizar() {
  /*
    if (this.listaProductos.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No hay productos en la venta'
      });
      return;
    }
    this.displayDialog = true;*/
  }

/*
constructor(
      private http: HttpClient,
      private messageService: MessageService
    ) {}
  */

  finalizarVenta() {

      /*
      if (this.listaProductos.length === 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'No hay productos en la venta'
        });
        return;
      }

    */
      this.displayDialog = true;

}

 confirmarVenta() {
    /*
    if (!this.formaPagoSeleccionada) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Debe seleccionar una forma de pago'
      });
      return;
      */


      // Aca tengo que cambiar lo que recibe el controller
      // o armarlo bien antes de mandarlo obteniendo las cosas del back
      // (necesitaria armar basicamente todos los dtos que reciben todos controller)

      const venta: VentaRequest = {
            productos: this.listaProductos,
            cliente: this.clienteSeleccionado || undefined,
            formaPago: this.formaPagoSeleccionada as 'EFECTIVO' | 'CREDITO' | 'DEBITO' | 'FIADO',
            fecha: new Date().toISOString()
          };


  calcularTotal(): number {
    return this.listaProductos.reduce((total, producto) => {
      return total + (producto.precio * producto.cantidad);
    }, 0);
  }


}
}
