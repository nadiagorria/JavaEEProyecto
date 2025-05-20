import { Component } from '@angular/core';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { ProductoDto, VentaDto, ClienteDto, UsuarioDto, CantidadDto } from 'src/models';



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
    PaginatorModule,
    CommonModule
  ],
  templateUrl: './nuevaventa.component.html',
  styleUrl: './nuevaventa.component.scss',
  providers: [MessageService]
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
      precioCompra: 12,
      precioVenta: 23,
      nombre: 'Laptop',
      codigoDeBarra: '123456',
      stockMin: 4,
      stockTotal: 10,
      imagen: '',
      categoria: { id: 1, nombre: 'Electrónicos' },
      proveedor: { id: 1, nombre: 'Tech SA' },
      promociones: [],
      combos: [],
      descuentos: [],
      lotes: [],
      cantidades: [],
      activo: true
    },
    {
      id: 2,
      precioCompra: 10,
      precioVenta: 20,
      nombre: 'Mouse',
      codigoDeBarra: '789012',
      stockMin: 5,
      stockTotal: 15,
      imagen: '',
      categoria: { id: 1, nombre: 'Electrónicos' },
      proveedor: { id: 1, nombre: 'Tech SA' },
      promociones: [],
      combos: [],
      descuentos: [],
      lotes: [],
      cantidades: [],
      activo: true
    },
    {
      id: 3,
      precioCompra: 25,
      precioVenta: 50,
      nombre: 'Teclado',
      codigoDeBarra: '345678',
      stockMin: 3,
      stockTotal: 8,
      imagen: '',
      categoria: { id: 1, nombre: 'Electrónicos' },
      proveedor: { id: 1, nombre: 'Tech SA' },
      promociones: [],
      combos: [],
      descuentos: [],
      lotes: [],
      cantidades: [],
      activo: true
    }
  ];

  clientes: ClienteDto[] = [
    {
      id: 1,
      nombre: 'Juan Pérez',
      telefono: '555-1234',
      credito: {
        id: 1,
        precioTotal: 0,
        pagoHastaAhora: 0
      },
      activo: true
    },
    {
      id: 2,
      nombre: 'María López',
      telefono: '555-5678',
      credito: {
        id: 2,
        precioTotal: 0,
        pagoHastaAhora: 0
      },
      activo: true
    },
    {
      id: 3,
      nombre: 'Mostrador',
      telefono: '555-9012',
      credito: {
        id: 3,
        precioTotal: 0,
        pagoHastaAhora: 0
      },
      activo: true
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

  filtrarProductos(event: { query: string }) {
    const query = event.query.toLowerCase();

    //matches exactos de codigos de barras
    const matchesExactos = this.productos.filter(producto =>
      producto.codigoDeBarra.toLowerCase() === query && producto.activo
    );

    if (matchesExactos.length > 0) {
      this.productosFiltrados = matchesExactos;
      return;
    }

    // sino, busca por inicio de código o nombre
    this.productosFiltrados = this.productos.filter(producto =>
      producto.activo && (
        producto.codigoDeBarra.toLowerCase().startsWith(query) ||
        producto.nombre.toLowerCase().includes(query)
      )
    );

  }

  agregarALista(event: { value: ProductoDto }) {
    const producto = event.value;
    if (!this.cantidades.some(c => c.producto.id === producto.id)) {
      const nuevaCantidad: CantidadDto = {
        id: 0,
        cantidad: 1,
        precioActual: producto.precioVenta,
        producto: {
          id: producto.id,
          nombre: producto.nombre,
          precioVenta: producto.precioVenta,
          codigoDeBarra: producto.codigoDeBarra
        },
        venta: {
          id: 0,
          fechaVenta: new Date()
        }
      };
      this.cantidades.push(nuevaCantidad);
      this.totalRecords++;
    }
    this.productoSeleccionado = null;
  }

  calcularCantidadTotal(): number {
  return this.cantidades.reduce((sum, c) => sum + c.cantidad, 0);
}

  calcularTotal(): number {
    return this.cantidades.reduce((total, cantidad) =>
      total + (cantidad.cantidad * cantidad.producto.precioVenta), 0);
  }



// Elimina un producto de la lista
eliminarProducto(cantidad: CantidadDto) {
  const index = this.cantidades.findIndex(c => c.producto.id === cantidad.producto.id);
  if (index !== -1) {
    this.cantidades = this.cantidades.filter((_, i) => i !== index);
    this.totalRecords--;
  }
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

    if (this.cantidades.length === 0) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'No hay productos en la venta'
    });
    return;
  }

    */


  // Aca tengo que cambiar lo que recibe el controller
  // o armarlo bien antes de mandarlo obteniendo las cosas del back
  // (necesitaria armar basicamente todos los dtos que reciben todos controller)

  const venta: Partial<VentaDto> = {
    fechaVenta: new Date(),
    total: this.calcularTotal(),
    formaPago: this.formaPagoSeleccionada,
    usuario: this.clienteSeleccionado ? {
      nombre: this.clienteSeleccionado.nombre,
      mail: this.clienteSeleccionado.mail
    } : undefined,
    cantidades: this.cantidades.map(c => ({
      id: 0,
      cantidad: c.cantidad,
      precioActual: c.precioActual,
      producto: {
        id: c.producto.id,
        nombre: c.producto.nombre,
        precioVenta: c.producto.precioVenta,
        codigoDeBarra: c.producto.codigoDeBarra
      }
    })),
    activo: true,
    finalizada: true
  };

  console.log('Venta a guardar:', venta);
  this.displayDialog = false;

}
}
