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
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ProductoService } from 'src/services/producto.service';
import { LoteService } from 'src/services/lote.service';
import { CategoriaService } from 'src/services/categoria.service';
import { EntidadService } from 'src/services/entidad.service';
import { ProductoDto } from 'src/models/producto.dto';
import { LoteDto } from 'src/models/lote.dto';
import { CategoriaDto } from 'src/models/categoria.dto';
import { ProveedorDto } from 'src/models/proveedor.dto';
import { ActivatedRoute, Router } from '@angular/router';

interface EditandoProducto {
  id: number | null;
  nombre: string;
  precioVenta: number;
  stockMin: number;
  categoriaId: number | null;
  proveedorId: number | null;
}


@Component({
  selector: 'app-producto-info',
  standalone: true,  
  imports: [
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
    DropdownModule,
    ConfirmDialogModule,
    ToastModule,
    HeaderComponent,
    FooterComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './producto-info.component.html',
  styleUrls: ['./producto-info.component.scss']
})
export class ProductoInfoComponent implements OnInit, OnDestroy {
  constructor(
        private productoService: ProductoService,
        private route: ActivatedRoute,
        public router: Router,
        private loteService: LoteService,
        private categoriaService: CategoriaService,
        private entidadService: EntidadService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
      ) { }

  producto?: ProductoDto;
  error: string = '';
  loading: boolean = true;
  imagenUrl: string = '';
  cacheImagenes = new Map<number, string>();
  // Edit modal properties
  mostrarModalEditar: boolean = false;
  editandoProducto: EditandoProducto = {
    id: null,
    nombre: '',
    precioVenta: 0,
    stockMin: 0,
    categoriaId: null,
    proveedorId: null
  };
  categorias: CategoriaDto[] = [];
  proveedores: ProveedorDto[] = [];
    // Existing lote modal properties
  mostrarModalAgregarLote: boolean = false;
  nuevoLote: Partial<LoteDto> = {
    numeLote: '',
    stock: 0,
    fechaVencimiento: undefined,
    precioCompra: 0
  };
  minFechaVencimiento: string = '';
  ngOnInit() {
    // Inicializar la fecha mínima de vencimiento
    const hoy = new Date();
    this.minFechaVencimiento = hoy.toISOString().split('T')[0];
    
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    if (id && !isNaN(id)) {
      this.cargarProducto(id);
      this.cargarCategorias();
      this.cargarProveedores();
    } else {
      this.error = 'ID de producto inválido';
      this.loading = false;
    }
  }

  cargarProducto(id: number) {
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
  private cargarCategorias(): void {
    this.categoriaService.listarCategorias().subscribe({
      next: (response) => {
        this.categorias = response.categorias;
        console.log('Categorías cargadas:', this.categorias);
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  private cargarProveedores(): void {
    this.entidadService.listadoProveedores().subscribe({
      next: (response) => {
        this.proveedores = response.proveedores;
        console.log('Proveedores cargados:', this.proveedores);
      },
      error: (error) => {
        console.error('Error al cargar proveedores:', error);
      }
    });
  }
  // EDIT FUNCTIONALITY
  abrirModalEditar(): void {
    if (!this.producto) return;
    
    // Asegurar que tengamos las categorías y proveedores cargados antes de abrir el modal
    if (this.categorias.length === 0) {
      this.cargarCategorias();
    }
    
    if (this.proveedores.length === 0) {
      this.cargarProveedores();
    }
    
    this.editandoProducto = {
      id: this.producto.id,
      nombre: this.producto.nombre,
      precioVenta: this.producto.precioVenta,
      stockMin: this.producto.stockMin,
      categoriaId: this.producto.categoria?.id || null,
      proveedorId: this.producto.proveedor?.id || null
    };
    
    console.log('Editando producto:', this.editandoProducto);
    console.log('Categoría seleccionada ID:', this.editandoProducto.categoriaId);
    console.log('Proveedor seleccionado ID:', this.editandoProducto.proveedorId);
    
    this.mostrarModalEditar = true;
  }
  editarProducto(): void {
    if (!this.editandoProducto.id || !this.validarFormularioEdicion()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor completa todos los campos requeridos'
      });
      return;
    }

    console.log('Guardando producto con categoriaId:', this.editandoProducto.categoriaId);
    console.log('Guardando producto con proveedorId:', this.editandoProducto.proveedorId);

    // Buscar la categoría y proveedor por ID
    const categoriaSeleccionada = this.categorias.find(c => c.id === this.editandoProducto.categoriaId);
    const proveedorSeleccionado = this.proveedores.find(p => p.id === this.editandoProducto.proveedorId);

    console.log('Categoría encontrada:', categoriaSeleccionada);
    console.log('Proveedor encontrado:', proveedorSeleccionado);

    // Construir el objeto ProductoDto completo para la edición
    const productoParaEditar: ProductoDto = {
      ...this.producto!,
      id: this.editandoProducto.id,
      nombre: this.editandoProducto.nombre!,
      precioVenta: this.editandoProducto.precioVenta!,
      stockMin: this.editandoProducto.stockMin!,
      categoria: categoriaSeleccionada || null,
      proveedor: proveedorSeleccionado || null
    };

    console.log('Producto para editar:', productoParaEditar);

    this.productoService.editarProducto(productoParaEditar).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Producto editado correctamente'
        });
        this.mostrarModalEditar = false;
        if (this.producto!.id !== null) {
          this.cargarProducto(this.producto!.id);
        }
      },
      error: (error) => {
        console.error('Error al editar producto:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo editar el producto'
        });
      }
    });
  }

  private validarFormularioEdicion(): boolean {
    return !!(
      this.editandoProducto.nombre &&
      this.editandoProducto.precioVenta !== undefined &&
      this.editandoProducto.precioVenta > 0 &&
      this.editandoProducto.stockMin !== undefined &&
      this.editandoProducto.stockMin >= 0
    );
  }

  // DELETE FUNCTIONALITY
  confirmarEliminarProducto(): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar este producto?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.eliminarProducto();
      }
    });
  }

  private eliminarProducto(): void {
    if (!this.producto?.id) return;

    this.productoService.eliminarProducto(this.producto.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Producto eliminado correctamente'
        });
        // Redirigir a la lista de productos después de un breve delay
        setTimeout(() => {
          this.router.navigate(['/productos']);
        }, 1500);
      },
      error: (error) => {
        console.error('Error al eliminar producto:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar el producto'
        });
      }
    });
  }

  // EXISTING LOTE FUNCTIONALITY
  eliminarLote(loteId: number) {
    if (!this.producto || this.producto.id === null) return;
    this.loteService.eliminarLote(loteId).subscribe({
      next: () => {
        // Quita el lote inactivo del array local
        this.producto!.lotes = this.producto!.lotes.filter(l => l.id !== loteId);
        if (this.producto!.id !== null) {
          this.cargarProducto(this.producto!.id);
        }
      },      error: (err) => {
        console.error('Error al eliminar lote:', err);
        let errorMessage = 'Error al eliminar el lote';
        
        // Handle different error response types (JSON or plain text)
        if (err.error) {
          if (typeof err.error === 'string') {
            errorMessage = err.error;
          } else if (err.error.message) {
            errorMessage = err.error.message;
          }
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
      }
    });  }agregarLote() {
    if (!this.producto || this.producto.id === null) return;
    
    // Validación básica
    if (!this.validarFormularioLote()) {
      return;
    }
    
    // Aseguramos que la fecha esté en el formato correcto
    let fechaVencimiento: Date;
    if (this.nuevoLote.fechaVencimiento) {
      // Si es string, convertirlo a Date
      if (typeof this.nuevoLote.fechaVencimiento === 'string') {
        fechaVencimiento = new Date(this.nuevoLote.fechaVencimiento);
      } else {
        fechaVencimiento = this.nuevoLote.fechaVencimiento;
      }
    } else {
      // Si no hay fecha, usar la fecha actual (no debería ocurrir por la validación)
      fechaVencimiento = new Date();
    }

    // Crear el objeto lote con datos validados
    const lote: LoteDto = {
      numeLote: this.nuevoLote.numeLote || '',
      stock: this.nuevoLote.stock || 0,
      fechaVencimiento: fechaVencimiento,
      precioCompra: this.nuevoLote.precioCompra || 0,
      id: null,
      activo: true,
      producto: { 
        id: this.producto.id, 
        nombre: this.producto.nombre 
      }
    };

    console.log('Enviando lote para crear:', lote);    this.loteService.crearLote(lote).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor al crear lote:', response);
        // Extraer el ID del lote de la respuesta (formato "Lote creado. ID: XXX")
        const idMatch = response.match(/ID: (\d+)/);
        const idLote = idMatch ? idMatch[1] : 'desconocido';
        
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Lote #${idLote} agregado correctamente`
        });
        
        // Recargar datos del producto
        if (this.producto!.id !== null) {
          this.cargarProducto(this.producto!.id);
        }
        
        this.mostrarModalAgregarLote = false;
        this.resetearFormularioLote();
      },      error: (err) => {
        console.error('Error al agregar lote:', err);
        let errorMessage = 'Error al agregar el lote. Verifique los datos e intente nuevamente.';
        
        // Handle different error response types (JSON or plain text)
        if (err.error) {
          if (typeof err.error === 'string') {
            errorMessage = err.error;
          } else if (err.error.message) {
            errorMessage = err.error.message;
          }
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
      }
    });
  }
  private resetearFormularioLote(): void {
    // Resetear los valores del formulario
    this.nuevoLote = {
      numeLote: '',
      stock: 0,
      fechaVencimiento: undefined,
      precioCompra: 0
    };
  }

  private validarFormularioLote(): boolean {
    if (!this.nuevoLote.numeLote || this.nuevoLote.numeLote.trim() === '') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'El número de lote es obligatorio'
      });
      return false;
    }

    if (this.nuevoLote.stock === undefined || this.nuevoLote.stock <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'El stock debe ser mayor que cero'
      });
      return false;
    }

    if (!this.nuevoLote.fechaVencimiento) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'La fecha de vencimiento es obligatoria'
      });
      return false;
    }

    if (this.nuevoLote.precioCompra === undefined || this.nuevoLote.precioCompra < 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'El precio de compra debe ser un valor válido'
      });
      return false;
    }

    return true;
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
