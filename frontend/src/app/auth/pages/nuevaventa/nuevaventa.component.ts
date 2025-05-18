import { Component } from '@angular/core';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { ProductoDto, VentaDto, UsuarioDto, CantidadDto } from '@shared/dtos';



/*interface Producto {
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
}*/


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


  productoSeleccionado: ProductoDto | null = null;
    cantidades: CantidadDto[] = [];
    productosFiltrados: ProductoDto[] = [];
    displayDialog: boolean = false;
    clienteSeleccionado: UsuarioDto | null = null;
    formaPagoSeleccionada: string = '';
    totalRecords: number = 0;


  // Mock de datos

 productos: ProductoDto[] = [
     {
       id: 1,
       nombre: 'Laptop',
       codigoBarras: '123456',
       precio: 1200,
       categoria: { id: 1, nombre: 'Electrónicos' },
       proveedor: { id: 1, nombre: 'Tech SA' },
       stock: 10
     },
     {
       id: 2,
       nombre: 'Mouse',
       codigoBarras: '789012',
       precio: 20,
       categoria: { id: 1, nombre: 'Electrónicos' },
       proveedor: { id: 1, nombre: 'Tech SA' },
       stock: 15
     },
     {
       id: 3,
       nombre: 'Teclado',
       codigoBarras: '345678',
       precio: 50,
       categoria: { id: 1, nombre: 'Electrónicos' },
       proveedor: { id: 1, nombre: 'Tech SA' },
       stock: 8
     }
   ];

   clientes: UsuarioDto[] = [
     {
       id: 1,
       nombre: 'Juan Pérez',
       email: 'juan@mail.com',
       rol: { id: 2, nombre: 'CLIENTE' }
     },
     {
       id: 2,
       nombre: 'María López',
       email: 'maria@mail.com',
       rol: { id: 2, nombre: 'CLIENTE' }
     },
     {
       id: 3,
       nombre: 'Mostrador',
       email: 'mostrador@mail.com',
       rol: { id: 2, nombre: 'CLIENTE' }
     }
   ];

   formasPago = [
     { label: 'Efectivo', value: 'EFECTIVO' },
     { label: 'Crédito', value: 'CREDITO' },
     { label: 'Débito', value: 'DEBITO' },
     { label: 'Fiado', value: 'FIADO' }
   ];



getPrecioVenta(productoId: number): number | undefined {
  return this.productos.find(p => p.id === productoId)?.precioVenta;
}

getCodigoDeBarra(productoId: number): string | undefined {
  return this.productos.find(p => p.id === productoId)?.codigoDeBarra;
}
   filtrarProductos(event: any) {
     const query = event.query.toLowerCase();
     this.productosFiltrados = this.productos.filter(producto =>
       producto.codigoBarras.toLowerCase().includes(query) ||
       producto.nombre.toLowerCase().includes(query)
     );
   }

   agregarALista(event: { value: ProductoDto }) {
     const producto = event.value;
     if (!this.cantidades.some(c => c.producto.id === producto.id)) {
       const nuevaCantidad: CantidadDto = {
         id: 0,
         cantidad: 1,
         producto: producto,
         venta: null
       };
       this.cantidades.push(nuevaCantidad);
       this.totalRecords++;
     }
     this.productoSeleccionado = null;
   }

   calcularTotal(): number {
     return this.cantidades.reduce((total, cantidad) =>
       total + (cantidad.cantidad * cantidad.producto.precio), 0);
   }
 }


  // Filtra productos al escribir en la barra
filtrarProductos(event: any) {
  const query = event.query.toLowerCase();

  // coincidencias exactas en códigos
  const matchesExactos = this.productos.filter(
    producto => producto.codigoDeBarra.toLowerCase() === query
  );

  if (matchesExactos.length > 0) {
    this.productosFiltrados = matchesExactos;
    return;
  }

  //busca por inicio de código o nombre
  this.productosFiltrados = this.productos.filter(
    producto =>
      producto.codigoDeBarra.toLowerCase().startsWith(query) ||
      producto.nombre.toLowerCase().includes(query)
  );
}

  agregarALista(event: { value: ProductoDto }) {
    const producto = event.value;
    if (!this.cantidades.some(c => c.producto.id === producto.id)) {
      const nuevaCantidad: CantidadDto = {
        id: 0,
        cantidad: 1,
        producto: {
          id: producto.id,
          nombre: producto.nombre
         },
        venta: null
      };
      this.cantidades.push(nuevaCantidad);
      this.totalRecords++;
      }
    this.productoSeleccionado = null;
  }

  // Elimina un producto de la lista
  eliminarProducto(cantidad: CantidadDto) {
    this.cantidades = this.cantidades.filter(c => c.producto.id !== cantidad.producto.id);
    this.totalRecords--;
  }




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

      const venta: Partial<VentaDto> = {
            fechaVenta: new Date(),
            total: this.calcularTotal(),
            formaPago: this.formaPagoSeleccionada,
            usuario: this.clienteSeleccionado ? {
              mail: this.clienteSeleccionado.email,
              nombre: this.clienteSeleccionado.nombre
            } : null,
            cantidades: this.cantidades.map(c => ({
              id: c.id,
              cantidad: c.cantidad
            })),
            activo: true,
            finalizada: true
          };

        console.log('Venta a guardar:', venta);
        this.displayDialog = false;


  calcularTotal(): number {
      return this.cantidades.reduce((total, cantidad) =>
        total + (cantidad.cantidad * (this.productos.find(p => p.id === cantidad.producto.id)?.precioVenta || 0)),
      0);
    }


}
}
