import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';   // necesario para pipes
import { TableModule } from 'primeng/table';      // necesario para p-table
import { ButtonModule } from 'primeng/button';    // necesario para botones pButton
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ProductoService } from 'src/services/producto.service';
import { LoteService } from 'src/services/lote.service';
import { ProductoDto } from 'src/models/producto.dto';
import { LoteDto } from 'src/models/lote.dto';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-producto-info',
  standalone: true,  imports: [
    CommonModule, 
    TableModule, 
    ButtonModule, 
    DialogModule, 
    FormsModule,
    CardModule,
    TagModule,
    DividerModule,
    InputTextModule,
    TooltipModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './producto-info.component.html',
  styleUrls: ['./producto-info.component.scss']
})
export class ProductoInfoComponent implements OnInit, OnDestroy {
  constructor(
        private productoService: ProductoService,
        private route: ActivatedRoute,
        public router: Router,
        private loteService: LoteService
      ) { }

  producto?: ProductoDto;
  error: string = '';
  loading: boolean = true;
  imagenUrl: string = '';
  cacheImagenes = new Map<number, string>();

  mostrarModalAgregarLote: boolean = false;

  nuevoLote: Partial<LoteDto> = {
    numeLote: '',
    stock: 0,
    fechaVencimiento: undefined,
    precioCompra: 0
  };

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    if (id && !isNaN(id)) {
      this.cargarProducto(id);
    } else {
      this.error = 'ID de producto inválido';
      this.loading = false;
    }
  }  cargarProducto(id: number) {
    this.loading = true;
    this.productoService.obtenerProducto(id).subscribe({
      next: (response) => {
        console.log('Respuesta del backend:', response);
        console.log('Lotes del producto:', response.lotes);
        this.producto = response;
        this.loading = false;
        
        // Cargar imagen del producto de forma asíncrona
        if (this.producto.id) {
          this.cargarImagenProducto(this.producto.id);
        }
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.error = 'Error al cargar el producto';
        this.loading = false;
      }
    });
  }

  private cargarImagenProducto(productoId: number): void {
    if (this.cacheImagenes.has(productoId)) {
      this.imagenUrl = this.cacheImagenes.get(productoId)!;
      return;
    }

    this.productoService.obtenerImagenProducto(productoId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.cacheImagenes.set(productoId, url);
        this.imagenUrl = url;
      },
      error: (error) => {
        console.error('Error al cargar imagen:', error);
        this.imagenUrl = '/placeholder-image.webp';
      }
    });
  }

  /*get lotesActivos() {
    return this.producto?.lotes?.filter(l => l.activo) || [];
  }*/
  eliminarLote(loteId: number) {
    if (!this.producto || this.producto.id === null) return;
    this.loteService.eliminarLote(loteId).subscribe({
      next: () => {
        // Quita el lote inactivo del array local
        this.producto!.lotes = this.producto!.lotes.filter(l => l.id !== loteId);
        if (this.producto!.id !== null) {
          this.cargarProducto(this.producto!.id);
        }
      },
      error: (err) => {
        alert('Error al eliminar el lote');
        console.error(err);
      }
    });
  }
  agregarLote() {
    if (!this.producto || this.producto.id === null) return;
    
    // Validación básica
    if (!this.validarFormularioLote()) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }
    
    const lote: LoteDto = {
      ...this.nuevoLote,
      id: null, // El backend asigna el id
      activo: true,
      producto: { id: this.producto.id, nombre: this.producto.nombre }
    } as LoteDto;

    this.loteService.crearLote(lote).subscribe({
      next: () => {
        if (this.producto!.id !== null) {
          this.cargarProducto(this.producto!.id);
        }
        this.mostrarModalAgregarLote = false;
        this.nuevoLote = { numeLote: '', stock: 0, fechaVencimiento: undefined, precioCompra: 0 };
      },
      error: (err) => {
        alert('Error al agregar el lote');
        console.error(err);
      }
    });
  }

  private validarFormularioLote(): boolean {
    return !!(
      this.nuevoLote.numeLote &&
      this.nuevoLote.stock !== undefined &&
      this.nuevoLote.stock > 0 &&
      this.nuevoLote.fechaVencimiento &&
      this.nuevoLote.precioCompra !== undefined &&
      this.nuevoLote.precioCompra >= 0
    );
  }

  ngOnDestroy(): void {
    this.limpiarCacheImagenes();
  }

  private limpiarCacheImagenes(): void {
    this.cacheImagenes.forEach(url => {
      URL.revokeObjectURL(url);
    });
    this.cacheImagenes.clear();
  }
  getFechaVencimientoClass(fecha: string): string {
    if (!fecha) return '';
    
    const fechaVencimiento = new Date(fecha);
    const hoy = new Date();
    const diferenciaDias = Math.ceil((fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 3600 * 24));
    
    if (diferenciaDias < 0) {
      return 'fecha-vencida';
    } else if (diferenciaDias <= 7) {
      return 'fecha-proxima';
    } else if (diferenciaDias <= 30) {
      return 'fecha-advertencia';
    }
    return 'fecha-normal';
  }

  getStockClass(stock: number): string {
    if (stock > 10) {
      return 'stock-alto';
    } else if (stock > 0) {
      return 'stock-medio';
    }
    return 'stock-bajo';
  }
}
