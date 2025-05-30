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
import { ProductoDto, VentaDto, ClienteDto, UsuarioDto, CantidadDto, CreditoDto } from 'src/models';
import { ProductoService } from '../../../services/producto.service';
import { VentaService } from '../../../services/venta.service';
import { ClienteService } from '../../../services/entidad.service';
import { CreditoService } from 'src/services/credito.service';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';


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
    CommonModule,
    FooterComponent,
    HeaderComponent
  ],
  templateUrl: './nuevaventa.component.html',
  styleUrl: './nuevaventa.component.scss',
  providers: [MessageService]
})
export class NuevaventaComponent {


  productoSeleccionado: ProductoDto | null = null;
  cantidades: CantidadDto[] = [];
  productosFiltrados: ProductoDto[] = [];
  productos: ProductoDto[] = [];
  displayDialog: boolean = false;
  clienteSeleccionado: UsuarioDto | null = null;
  creditoSeleccionado: Pick<CreditoDto, 'id' | 'precioTotal' | 'cliente'> | null = null;
  creditos: Pick<CreditoDto, 'id' | 'precioTotal' | 'cliente'>[] = [];
  formaPagoSeleccionada: string = '';
  totalRecords: number = 0;

  formasPago = [
    { label: 'Efectivo', value: 'EFECTIVO' },
    { label: 'Crédito', value: 'CREDITO' },
    { label: 'Débito', value: 'DEBITO' },
    { label: 'Fiado', value: 'FIADO' }
  ];

  constructor(
    private productoService: ProductoService,
    private ventaService: VentaService,
    private creditoService: CreditoService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.cargarProductos();
  }

  cargarCreditos() {
    this.creditoService.listarCreditos().subscribe({
      next: (response) => {
        this.creditos = response.creditos;
      },
      error: (error) => {
        console.error('Error al cargar créditos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los créditos'
        });
      }
    });
  }

  onFormaPagoChange() {
    if (this.formaPagoSeleccionada === 'FIADO') {
      this.cargarCreditos();
    } else {
      this.creditoSeleccionado = null;
    }
  }

  cargarProductos() {
    this.productoService.listarProductos().subscribe({
      next: (response) => {
        this.productos = response.productos;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los productos'
        });
      }
    });
  }

  



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
        id: null,
        cantidad: 1,
        precioActual: producto.precioVenta,
        producto: {
          id: producto.id,
          nombre: producto.nombre,
          precioVenta: producto.precioVenta,
          codigoDeBarra: producto.codigoDeBarra
        },
        venta: {
          id: null,
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



  finalizarVenta() {

    
    if (this.cantidades.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No hay productos en la venta'
      });
      return;
    }
  
  
    this.displayDialog = true;

  }

  confirmarVenta() {

    if (!this.formaPagoSeleccionada) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Debe seleccionar una forma de pago'
      });
      return;
    }

    if (this.cantidades.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No hay productos en la venta'
      });
      return;
    }

    const venta: Partial<VentaDto> = {
      fechaVenta: new Date(),
      total: this.calcularTotal(),
      formaPago: this.formaPagoSeleccionada,
      credito: this.formaPagoSeleccionada === 'FIADO' ? {
        id: this.creditoSeleccionado!.id,
        precioTotal: this.calcularTotal()
      } : undefined,
      cantidades: this.cantidades.map(c => ({
        id: null,
        cantidad: c.cantidad,
        precioActual: c.precioActual ?? c.producto.precioVenta,
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

    this.ventaService.crearVenta(venta as VentaDto).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Venta creada correctamente'
        });
        this.displayDialog = false;
        this.limpiarVenta();
      },
      error: (error) => {
        console.error('Error al crear la venta:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al crear la venta'
        });
      }
    });

  }

  limpiarVenta() {
    this.cantidades = [];
    this.totalRecords = 0;
    this.creditoSeleccionado = null;
    this.formaPagoSeleccionada = '';
    this.productoSeleccionado = null;
}


}

