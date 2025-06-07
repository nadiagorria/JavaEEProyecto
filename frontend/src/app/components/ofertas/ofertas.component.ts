import { Component, OnInit } from '@angular/core';
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
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { OfertaService } from '../../../services/oferta.service';
import { ProductoService } from '../../../services/producto.service';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { PromocionDto, ComboDto, DescuentoDto, ProductoDto } from '../../../models';

@Component({
  selector: 'app-ofertas',
  standalone: true,  imports: [
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
    HeaderComponent,
    FooterComponent
  ],
  providers: [MessageService],
  templateUrl: './ofertas.component.html',
  styleUrl: './ofertas.component.scss'
})
export class OfertasComponent implements OnInit {

  // Arrays para las tablas
  promociones: PromocionDto[] = [];
  combos: ComboDto[] = [];
  descuentos: DescuentoDto[] = [];
  productos: ProductoDto[] = [];

  // Modales
  mostrarModalPromocion: boolean = false;
  mostrarModalCombo: boolean = false;
  mostrarModalDescuento: boolean = false;

  // Formularios
  nuevaPromocion: Partial<PromocionDto> = {
    descripcion: '',
    descuento: 0,
    activo: true,
    inicio: new Date(),
    fin: new Date(),
    producto: { id: 0, nombre: '' }
  };

  nuevoCombo: Partial<ComboDto> = {
    descripcion: '',
    descuento: 0,
    activo: true,
    inicio: new Date(),
    fin: new Date(),
    productos: []
  };

  nuevoDescuento: Partial<DescuentoDto> = {
    descuento: 0,
    activo: true,
    inicio: new Date(),
    fin: new Date(),
    producto: { id: 0, nombre: '' }
  };

  // Variables para los formularios
  productoSeleccionadoPromocion: number = 0;
  productoSeleccionadoDescuento: number = 0;
  productosSeleccionadosCombo: number[] = [];

  // Variables para edición
  editandoPromocion: boolean = false;
  editandoCombo: boolean = false;
  editandoDescuento: boolean = false;

  constructor(
    private ofertaService: OfertaService,
    private productoService: ProductoService,
    private messageService: MessageService,
    private router: Router
  ) { }

  ngOnInit() {
    this.cargarDatos();
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
          detail: 'Error al cargar las promociones'
        });
      }
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
          detail: 'Error al cargar los combos'
        });
      }
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
          detail: 'Error al cargar los descuentos'
        });
      }
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
          detail: 'Error al cargar los productos'
        });
      }
    });
  }

  // ==================== PROMOCIONES ====================
  abrirModalPromocion() {
    this.editandoPromocion = false;
    this.nuevaPromocion = {
      descripcion: '',
      descuento: 0,
      activo: true,
      inicio: new Date(),
      fin: new Date(),
      producto: { id: 0, nombre: '' }
    };
    this.productoSeleccionadoPromocion = 0;
    this.mostrarModalPromocion = true;
  }
  
  editarPromocion(promocion: PromocionDto) {
    this.editandoPromocion = true;
    this.nuevaPromocion = { ...promocion };
    this.productoSeleccionadoPromocion = promocion.producto?.id || 0;
    this.mostrarModalPromocion = true;
  }
  guardarPromocion() {
    if (!this.validarPromocion()) {
      return;
    }

    // Sincronizar el producto antes de guardar
    const productoSeleccionado = this.productos.find(p => p.id === this.productoSeleccionadoPromocion);
    if (productoSeleccionado && productoSeleccionado.id !== null) {
      this.nuevaPromocion.producto = { 
        id: productoSeleccionado.id, 
        nombre: productoSeleccionado.nombre || '' 
      };
    }

    const promocion = this.nuevaPromocion as PromocionDto;

    if (this.editandoPromocion) {
      this.ofertaService.editarPromocion(promocion).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Promoción actualizada correctamente'
          });
          this.mostrarModalPromocion = false;
          this.cargarPromociones();
        },
        error: (error) => {
          console.error('Error al actualizar promoción:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar la promoción'
          });
        }
      });    } else {
      this.ofertaService.crearPromocion(promocion).subscribe({
        next: (response) => {
          console.log('Promoción creada exitosamente:', response);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Promoción creada correctamente'
          });
          this.mostrarModalPromocion = false;
          this.cargarPromociones();
        },
        error: (error) => {
          console.error('Error al crear promoción:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear la promoción'
          });
        }
      });
    }
  }
  validarPromocion(): boolean {
    if (!this.nuevaPromocion.descripcion || this.nuevaPromocion.descripcion.trim() === '') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'La descripción es requerida'
      });
      return false;
    }

    if (!this.productoSeleccionadoPromocion || this.productoSeleccionadoPromocion === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe seleccionar un producto'
      });
      return false;
    }

    if (!this.nuevaPromocion.descuento || this.nuevaPromocion.descuento <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'La cantidad de unidades debe ser mayor a 0'
      });
      return false;
    }

    return true;
  }

  // ==================== COMBOS ====================
  abrirModalCombo() {
    this.editandoCombo = false;
    this.nuevoCombo = {
      descripcion: '',
      descuento: 0,
      activo: true,
      inicio: new Date(),
      fin: new Date(),
      productos: []
    };
    this.productosSeleccionadosCombo = [];
    this.mostrarModalCombo = true;
  }  editarCombo(combo: ComboDto) {
    this.editandoCombo = true;
    this.nuevoCombo = { 
      ...combo,
      productos: combo.productos || []
    };
    this.productosSeleccionadosCombo = combo.productos?.map(p => p.id).filter((id): id is number => id !== null) || [];
    this.mostrarModalCombo = true;
  }
  guardarCombo() {
    if (!this.validarCombo()) {
      return;
    }    // Sincronizar los productos antes de guardar
    this.nuevoCombo.productos = this.productosSeleccionadosCombo.map((id: number) => {
      const producto = this.productos.find((p: ProductoDto) => p.id === id);
      return { 
        id: producto?.id || 0, 
        nombre: producto?.nombre || '' 
      };
    }).filter((p: { id: number; nombre: string }) => p.id !== 0);

    const combo = this.nuevoCombo as ComboDto;

    if (this.editandoCombo) {
      this.ofertaService.editarCombo(combo).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Combo actualizado correctamente'
          });
          this.mostrarModalCombo = false;
          this.cargarCombos();
        },
        error: (error) => {
          console.error('Error al actualizar combo:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar el combo'
          });
        }
      });    } else {
      this.ofertaService.crearCombo(combo).subscribe({
        next: (response) => {
          console.log('Combo creado exitosamente:', response);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Combo creado correctamente'
          });
          this.mostrarModalCombo = false;
          this.cargarCombos();
        },
        error: (error) => {
          console.error('Error al crear combo:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear el combo'
          });
        }
      });
    }
  }
  validarCombo(): boolean {
    if (!this.nuevoCombo.descripcion || this.nuevoCombo.descripcion.trim() === '') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'La descripción es requerida'
      });
      return false;
    }

    if (!this.productosSeleccionadosCombo || this.productosSeleccionadosCombo.length < 2) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe seleccionar al menos 2 productos'
      });
      return false;
    }

    if (!this.nuevoCombo.descuento || this.nuevoCombo.descuento <= 0 || this.nuevoCombo.descuento >= 100) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'El descuento debe ser mayor a 0% y menor a 100%'
      });
      return false;
    }

    return true;
  }

  // ==================== DESCUENTOS ====================
  abrirModalDescuento() {
    this.editandoDescuento = false;
    this.nuevoDescuento = {
      descuento: 0,
      activo: true,
      inicio: new Date(),
      fin: new Date(),
      producto: { id: 0, nombre: '' }
    };
    this.productoSeleccionadoDescuento = 0;
    this.mostrarModalDescuento = true;
  }
  editarDescuento(descuento: DescuentoDto) {
    this.editandoDescuento = true;
    this.nuevoDescuento = { ...descuento };
    this.productoSeleccionadoDescuento = descuento.producto?.id || 0;
    this.mostrarModalDescuento = true;
  }
  guardarDescuento() {
    if (!this.validarDescuento()) {
      return;
    }

    // Sincronizar el producto antes de guardar
    const productoSeleccionado = this.productos.find((p: ProductoDto) => p.id === this.productoSeleccionadoDescuento);
    if (productoSeleccionado && productoSeleccionado.id !== null) {
      this.nuevoDescuento.producto = { 
        id: productoSeleccionado.id, 
        nombre: productoSeleccionado.nombre || '' 
      };
    }

    const descuento = this.nuevoDescuento as DescuentoDto;

    if (this.editandoDescuento) {
      this.ofertaService.editarDescuento(descuento).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Descuento actualizado correctamente'
          });
          this.mostrarModalDescuento = false;
          this.cargarDescuentos();
        },
        error: (error) => {
          console.error('Error al actualizar descuento:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar el descuento'
          });
        }
      });    } else {
      this.ofertaService.crearDescuento(descuento).subscribe({
        next: (response) => {
          console.log('Descuento creado exitosamente:', response);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Descuento creado correctamente'
          });
          this.mostrarModalDescuento = false;
          this.cargarDescuentos();
        },
        error: (error) => {
          console.error('Error al crear descuento:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear el descuento'
          });
        }
      });
    }
  }
  validarDescuento(): boolean {
    if (!this.productoSeleccionadoDescuento || this.productoSeleccionadoDescuento === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe seleccionar un producto'
      });
      return false;
    }

    if (!this.nuevoDescuento.descuento || this.nuevoDescuento.descuento <= 0 || this.nuevoDescuento.descuento >= 100) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'El descuento debe ser mayor a 0% y menor a 100%'
      });
      return false;
    }

    return true;  }

  // ==================== UTILIDADES ====================
  
  onProductoChange(event: any, tipo: 'promocion' | 'descuento') {
    const producto = this.productos.find((p: ProductoDto) => p.id === event.value);
    if (producto && producto.id !== null) {
      if (tipo === 'promocion') {
        this.productoSeleccionadoPromocion = producto.id;
        this.nuevaPromocion.producto = { id: producto.id, nombre: producto.nombre || '' };
      } else {
        this.productoSeleccionadoDescuento = producto.id;
        this.nuevoDescuento.producto = { id: producto.id, nombre: producto.nombre || '' };
      }
    }  }
  
  onProductosComboChange(event: any) {
    this.productosSeleccionadosCombo = event.value;
    this.nuevoCombo.productos = event.value.map((id: number) => {
      const producto = this.productos.find((p: ProductoDto) => p.id === id);
      return { 
        id: producto?.id || 0, 
        nombre: producto?.nombre || '' 
      };
    }).filter((p: { id: number; nombre: string }) => p.id !== 0);  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-ES');  }
  
  formatearProductos(productos: Pick<ProductoDto, 'id' | 'nombre'>[]): string {
    return productos.map((p: Pick<ProductoDto, 'id' | 'nombre'>) => p.nombre).join(', ');
  }
}
