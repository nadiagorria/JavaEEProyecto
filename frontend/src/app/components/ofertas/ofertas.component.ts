import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { OfertaService } from '../../../services/oferta.service';
import { ProductoService } from '../../../services/producto.service';
import { SecurityService } from '../../../services/security.service';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import {
  PromocionDto,
  ComboDto,
  DescuentoDto,
  ProductoDto,
} from '../../../models';

@Component({
  selector: 'app-ofertas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    MultiSelectModule,
    CalendarModule,
    CheckboxModule,
    TabViewModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    HeaderComponent,
    FooterComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './ofertas.component.html',
  styleUrl: './ofertas.component.scss',
})
export class OfertasComponent implements OnInit, AfterViewInit {
  promociones: PromocionDto[] = [];
  combos: ComboDto[] = [];
  descuentos: DescuentoDto[] = [];
  productos: ProductoDto[] = [];

  mostrarModalPromocion: boolean = false;
  mostrarModalCombo: boolean = false;
  mostrarModalDescuento: boolean = false;

  nuevaPromocion: Partial<PromocionDto> = {
    descripcion: '',
    descuento: 0,
    activo: true,
    inicio: this.getTodayISOString(),
    fin: this.getTomorrowISOString(),
    producto: { id: 0, nombre: '' },
  };

  nuevoCombo: Partial<ComboDto> = {
    descripcion: '',
    descuento: 0,
    activo: true,
    inicio: this.getTodayISOString(),
    fin: this.getTomorrowISOString(),
    productos: [],
  };

  nuevoDescuento: Partial<DescuentoDto> = {
    descripcion: '',
    descuento: 0,
    activo: true,
    inicio: this.getTodayISOString(),
    fin: this.getTomorrowISOString(),
    producto: { id: 0, nombre: '' },
  };

  productoSeleccionadoPromocion: number = 0;
  productoSeleccionadoDescuento: number = 0;
  productosSeleccionadosCombo: number[] = [];

  constructor(
    private ofertaService: OfertaService,
    private productoService: ProductoService,
    private securityService: SecurityService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  private getTodayISOString(): string {
    return new Date().toISOString().split('T')[0];
  }

  isAdmin(): boolean {
    const roles = this.securityService.getUserRoles();

    if (!roles) {
      return false;
    }

    const hasAdminRole = roles.includes('ADMIN');

    return hasAdminRole;
  }

  private getTomorrowISOString(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  private formatDateForDisplay(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }

  ngOnInit() {
    this.cargarDatos();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initializeDates();
    }, 100);
  }

  private initializeDates() {
    const today = this.getTodayISOString();
    const tomorrow = this.getTomorrowISOString();

    if (!this.nuevaPromocion.inicio) {
      this.nuevaPromocion.inicio = today;
    }
    if (!this.nuevaPromocion.fin) {
      this.nuevaPromocion.fin = tomorrow;
    }

    if (!this.nuevoCombo.inicio) {
      this.nuevoCombo.inicio = today;
    }
    if (!this.nuevoCombo.fin) {
      this.nuevoCombo.fin = tomorrow;
    }

    if (!this.nuevoDescuento.inicio) {
      this.nuevoDescuento.inicio = today;
    }
    if (!this.nuevoDescuento.fin) {
      this.nuevoDescuento.fin = tomorrow;
    }
  }

  cargarDatos() {
    this.cargarPromociones();
    this.cargarCombos();
    this.cargarDescuentos();
    this.cargarProductos();
  }

  cargarPromociones() {
    this.ofertaService.listarPromociones().subscribe({
      next: (response) => {
        this.promociones = response.promociones;
      },
      error: (error) => {
        console.error('Error al cargar promociones:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar las promociones',
        });
      },
    });
  }

  cargarCombos() {
    this.ofertaService.listarCombos().subscribe({
      next: (response) => {
        this.combos = response.combos;
      },
      error: (error) => {
        console.error('Error al cargar combos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los combos',
        });
      },
    });
  }

  cargarDescuentos() {
    this.ofertaService.listarDescuentos().subscribe({
      next: (response) => {
        this.descuentos = response.descuentos;
      },
      error: (error) => {
        console.error('Error al cargar descuentos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los descuentos',
        });
      },
    });
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
          detail: 'Error al cargar los productos',
        });
      },
    });
  }

  abrirModalPromocion() {
    this.nuevaPromocion = {
      descripcion: '',
      descuento: 0,
      activo: true,
      inicio: this.getTodayISOString(),
      fin: this.getTomorrowISOString(),
      producto: { id: 0, nombre: '' },
    };
    this.productoSeleccionadoPromocion = 0;
    this.mostrarModalPromocion = true;
  }

  guardarPromocion() {
    if (!this.validarPromocion()) {
      return;
    }

    const productoSeleccionado = this.productos.find(
      (p) => p.id === this.productoSeleccionadoPromocion
    );
    if (productoSeleccionado && productoSeleccionado.id !== null) {
      this.nuevaPromocion.producto = {
        id: productoSeleccionado.id,
        nombre: productoSeleccionado.nombre || '',
      };
    }
    const promocion: PromocionDto = {
      id: 0,
      descripcion: this.nuevaPromocion.descripcion || '',
      descuento: this.nuevaPromocion.descuento || 0,
      activo: this.nuevaPromocion.activo || true,
      inicio: this.nuevaPromocion.inicio || this.getTodayISOString(),
      fin: this.nuevaPromocion.fin || this.getTomorrowISOString(),
      producto: this.nuevaPromocion.producto || { id: 0, nombre: '' },
    };

    this.ofertaService.crearPromocion(promocion).subscribe({
      next: (response) => {
        console.log('Promoción creada exitosamente:', response);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Promoción creada correctamente',
        });
        this.mostrarModalPromocion = false;
        this.cargarPromociones();
      },
      error: (error) => {
        console.error('Error al crear promoción:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Error completo:', error);

        let errorMessage = 'Error al crear la promoción';
        if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage,
        });
      },
    });
  }

  validarPromocion(): boolean {
    if (
      !this.nuevaPromocion.descripcion ||
      this.nuevaPromocion.descripcion.trim() === ''
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'La descripción es requerida',
      });
      return false;
    }

    if (
      !this.productoSeleccionadoPromocion ||
      this.productoSeleccionadoPromocion === 0
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe seleccionar un producto',
      });
      return false;
    }

    if (!this.nuevaPromocion.descuento || this.nuevaPromocion.descuento < 2) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail:
          'La cantidad de unidades mínima debe ser 2 (para promociones tipo 2x1, 3x2, etc.)',
      });
      return false;
    }

    return true;
  }

  abrirModalCombo() {
    this.nuevoCombo = {
      descripcion: '',
      descuento: 0,
      activo: true,
      inicio: this.getTodayISOString(),
      fin: this.getTomorrowISOString(),
      productos: [],
    };
    this.productosSeleccionadosCombo = [];
    this.mostrarModalCombo = true;
  }

  guardarCombo() {
    if (!this.validarCombo()) {
      return;
    }

    const productosCombo = this.productosSeleccionadosCombo
      .map((id: number) => {
        const producto = this.productos.find((p: ProductoDto) => p.id === id);
        return {
          id: producto?.id || 0,
          nombre: producto?.nombre || '',
        };
      })
      .filter((p: { id: number; nombre: string }) => p.id !== 0);
    const combo: ComboDto = {
      id: 0,
      descripcion: this.nuevoCombo.descripcion || '',
      descuento: this.nuevoCombo.descuento || 0,
      activo: this.nuevoCombo.activo || true,
      inicio: this.nuevoCombo.inicio || this.getTodayISOString(),
      fin: this.nuevoCombo.fin || this.getTomorrowISOString(),
      productos: productosCombo,
    };

    this.ofertaService.crearCombo(combo).subscribe({
      next: (response) => {
        console.log('Combo creado exitosamente:', response);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Combo creado correctamente',
        });
        this.mostrarModalCombo = false;
        this.cargarCombos();
      },
      error: (error) => {
        console.error('Error al crear combo:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Error completo:', error);

        let errorMessage = 'Error al crear el combo';
        if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage,
        });
      },
    });
  }
  validarCombo(): boolean {
    if (
      !this.nuevoCombo.descripcion ||
      this.nuevoCombo.descripcion.trim() === ''
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'La descripción es requerida',
      });
      return false;
    }

    if (
      !this.productosSeleccionadosCombo ||
      this.productosSeleccionadosCombo.length < 2
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe seleccionar al menos 2 productos',
      });
      return false;
    }

    if (
      !this.nuevoCombo.descuento ||
      this.nuevoCombo.descuento <= 0 ||
      this.nuevoCombo.descuento >= 100
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'El descuento debe ser mayor a 0% y menor a 100%',
      });
      return false;
    }

    return true;
  }

  abrirModalDescuento() {
    this.nuevoDescuento = {
      descripcion: '',
      descuento: 0,
      activo: true,
      inicio: this.getTodayISOString(),
      fin: this.getTomorrowISOString(),
      producto: { id: 0, nombre: '' },
    };
    this.productoSeleccionadoDescuento = 0;
    this.mostrarModalDescuento = true;
  }

  guardarDescuento() {
    if (!this.validarDescuento()) {
      return;
    }

    const productoSeleccionado = this.productos.find(
      (p: ProductoDto) => p.id === this.productoSeleccionadoDescuento
    );
    if (productoSeleccionado && productoSeleccionado.id !== null) {
      this.nuevoDescuento.producto = {
        id: productoSeleccionado.id,
        nombre: productoSeleccionado.nombre || '',
      };
    }
    const descuento: DescuentoDto = {
      id: 0,
      descripcion: this.nuevoDescuento.descripcion || '',
      descuento: this.nuevoDescuento.descuento || 0,
      activo: this.nuevoDescuento.activo || true,
      inicio: this.nuevoDescuento.inicio || this.getTodayISOString(),
      fin: this.nuevoDescuento.fin || this.getTomorrowISOString(),
      producto: this.nuevoDescuento.producto || { id: 0, nombre: '' },
    };

    this.ofertaService.crearDescuento(descuento).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Descuento creado correctamente',
        });
        this.mostrarModalDescuento = false;
        this.cargarDescuentos();
      },
      error: (error) => {
        console.error('Error al crear descuento:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Error completo:', error);

        let errorMessage = 'Error al crear el descuento';
        if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage,
        });
      },
    });
  }

  validarDescuento(): boolean {
    if (
      !this.nuevoDescuento.descripcion ||
      this.nuevoDescuento.descripcion.trim() === ''
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'La descripción es requerida',
      });
      return false;
    }

    if (
      !this.productoSeleccionadoDescuento ||
      this.productoSeleccionadoDescuento === 0
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe seleccionar un producto',
      });
      return false;
    }

    if (
      !this.nuevoDescuento.descuento ||
      this.nuevoDescuento.descuento <= 0 ||
      this.nuevoDescuento.descuento >= 100
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'El descuento debe ser mayor a 0% y menor a 100%',
      });
      return false;
    }

    return true;
  }

  onProductoChange(event: any, tipo: 'promocion' | 'descuento') {
    const producto = this.productos.find(
      (p: ProductoDto) => p.id === event.value
    );
    if (producto && producto.id !== null) {
      if (tipo === 'promocion') {
        this.productoSeleccionadoPromocion = producto.id;
        this.nuevaPromocion.producto = {
          id: producto.id,
          nombre: producto.nombre || '',
        };
      } else {
        this.productoSeleccionadoDescuento = producto.id;
        this.nuevoDescuento.producto = {
          id: producto.id,
          nombre: producto.nombre || '',
        };
      }
    }
  }

  onProductosComboChange(event: any) {
    this.productosSeleccionadosCombo = event.value;
    this.nuevoCombo.productos = event.value
      .map((id: number) => {
        const producto = this.productos.find((p: ProductoDto) => p.id === id);
        return {
          id: producto?.id || 0,
          nombre: producto?.nombre || '',
        };
      })
      .filter((p: { id: number; nombre: string }) => p.id !== 0);
  }

  formatearFecha(fecha: string): string {
    return this.formatDateForDisplay(fecha);
  }

  formatearProductos(productos: Pick<ProductoDto, 'id' | 'nombre'>[]): string {
    return productos
      .map((p: Pick<ProductoDto, 'id' | 'nombre'>) => p.nombre)
      .join(', ');
  }

  eliminarOferta(id: number, tipo: 'promocion' | 'combo' | 'descuento') {
    const articulo = tipo === 'promocion' ? 'esta' : 'este';

    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar ${articulo} ${tipo}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.ofertaService.eliminarOferta(id).subscribe({
          next: (response) => {
            const articuloEliminado =
              tipo === 'promocion' ? 'eliminada' : 'eliminado';
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: `${
                tipo.charAt(0).toUpperCase() + tipo.slice(1)
              } ${articuloEliminado} correctamente`,
            });

            switch (tipo) {
              case 'promocion':
                this.cargarPromociones();
                break;
              case 'combo':
                this.cargarCombos();
                break;
              case 'descuento':
                this.cargarDescuentos();
                break;
            }
          },
          error: (error) => {
            console.error(`Error al eliminar ${tipo}:`, error);

            const articuloError = tipo === 'promocion' ? 'la' : 'el';
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `Error al eliminar ${articuloError} ${tipo}`,
            });
          },
        });
      },
    });
  }
}
