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
import { FileUploadModule } from 'primeng/fileupload';

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
    FileUploadModule,
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
  categorias: CategoriaDto[] = [];  proveedores: ProveedorDto[] = [];
  
  // Helper function for getting today's date in ISO format
  private getTodayISOString(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Existing lote modal properties
  mostrarModalAgregarLote: boolean = false;
  nuevoLote: {
    numeLote: string;
    stock: number;
    fechaVencimiento: string | undefined;
    precioCompra: number;
  } = {
    numeLote: '',
    stock: 0,
    fechaVencimiento: undefined, // Optional field
    precioCompra: 0
  };
  minFechaVencimiento: string = '';

  // Image upload properties
  imagenSeleccionada: File | null = null;
  imagenPreviewEdicion: string | null = null;
  ngOnInit() {
    // Inicializar la fecha mínima de vencimiento
    const hoy = new Date();
    this.minFechaVencimiento = hoy.toISOString().split('T')[0];
    
    // La fecha de vencimiento se mantiene como undefined (opcional)
    // this.nuevoLote.fechaVencimiento permanece undefined por defecto
    
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    if (id && !isNaN(id)) {
      this.cargarProducto(id);
      this.cargarCategorias();
      this.cargarProveedores();
    } else {
      this.error = 'ID de producto inválido';
      this.loading = false;
    }
  }cargarProducto(id: number) {
    this.loading = true;
    this.productoService.obtenerProducto(id).subscribe({      next: (response) => {
        console.log('Respuesta del backend:', response);
        console.log('Lotes del producto:', response.lotes);
        this.producto = response;
        
        // Ordenar lotes por fecha de vencimiento
        if (this.producto.lotes) {
          this.producto.lotes.sort((a, b) => {
            // Si alguno no tiene fecha de vencimiento, ponerlo al final
            if (!a.fechaVencimiento) return 1;
            if (!b.fechaVencimiento) return -1;
            
            // Convertir strings a fechas y comparar
            const fechaA = new Date(a.fechaVencimiento);
            const fechaB = new Date(b.fechaVencimiento);
            return fechaA.getTime() - fechaB.getTime();
          });
        }
        
        this.loading = false;
        
        // Cargar imagen del producto de forma asíncrona
        if (this.producto.id) {
          this.cargarImagenProducto(this.producto.id);
        }

        // Verificar precios de lotes actuales
        this.verificarPreciosLotesActuales();
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.error = 'Error al cargar el producto';
        this.loading = false;
      }
    });
  }
  private verificarPrecios(): void {
    if (!this.producto || !this.producto.lotes) return;

    // Filtrar solo lotes activos que tienen precio de compra mayor al precio de venta
    const lotesConPrecioMayor = this.producto.lotes.filter(
      lote => lote.activo && lote.precioCompra > this.producto!.precioVenta
    );

    if (lotesConPrecioMayor.length > 0) {
      lotesConPrecioMayor.forEach(lote => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia de Precios',
          detail: `Lote ${lote.numeLote}: El precio de venta actual (${this.producto!.precioVenta}) es menor al precio de compra (${lote.precioCompra}). Esto resulta en pérdidas.`,
          life: 10000
        });
      });
    }
  }

  private verificarPreciosLotesActuales(): void {
    if (!this.producto || !this.producto.lotes) return;

    // Filtrar solo lotes activos que tienen precio de compra mayor al precio de venta
    const lotesConPrecioMayor = this.producto.lotes.filter(
      lote => lote.activo && lote.precioCompra > this.producto!.precioVenta
    );

    if (lotesConPrecioMayor.length > 0) {
      lotesConPrecioMayor.forEach(lote => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia de Precios',
          detail: `Lote ${lote.numeLote}: El precio de venta actual (${this.producto!.precioVenta}) es menor al precio de compra (${lote.precioCompra}). Esto resulta en pérdidas.`,
          life: 10000
        });
      });
    }
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

    // Primero editar el producto
    this.productoService.editarProducto(productoParaEditar).subscribe({
      next: () => {
        // Si hay una nueva imagen, actualizarla
        if (this.imagenSeleccionada) {
          this.productoService.actualizarImagenProducto(this.editandoProducto.id!, this.imagenSeleccionada).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Producto e imagen actualizados correctamente'
              });
              this.finalizarEdicion();
            },
            error: (error) => {
              console.error('Error al actualizar la imagen:', error);
              this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Producto actualizado pero hubo un error al actualizar la imagen'
              });
              this.finalizarEdicion();
            }
          });
        } else {
          // Si no hay imagen nueva, solo mostrar mensaje de éxito
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Producto actualizado correctamente'
          });
          this.finalizarEdicion();
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

  private finalizarEdicion(): void {
    this.mostrarModalEditar = false;
    if (this.producto!.id !== null) {
      this.cargarProducto(this.producto!.id);
    }
    // Reset image selection
    this.imagenSeleccionada = null;
    this.imagenPreviewEdicion = null;
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
    });  }  agregarLote() {
    if (!this.producto || this.producto.id === null) return;
    
    if (!this.validarFormularioLote()) {
      return;
    }    // Crear el objeto lote con datos validados - fecha de vencimiento opcional
    const lote: LoteDto = {
      numeLote: this.nuevoLote.numeLote || '',
      stock: this.nuevoLote.stock || 0,
      fechaVencimiento: this.nuevoLote.fechaVencimiento || undefined,
      precioCompra: this.nuevoLote.precioCompra || 0,
      id: null,
      activo: true,
      producto: { 
        id: this.producto.id, 
        nombre: this.producto.nombre 
      }
    };

    
    this.loteService.crearLote(lote).subscribe({
      next: (response) => {
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
  }  private resetearFormularioLote(): void {
    // Resetear los valores del formulario - fecha de vencimiento opcional
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

    // La fecha de vencimiento es opcional, no se valida

    if (this.nuevoLote.precioCompra === undefined || this.nuevoLote.precioCompra < 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'El precio de compra debe ser un valor válido'
      });
      return false;
    }    // Verificar si el precio de compra del nuevo lote es mayor al precio de venta actual
    if (this.producto && this.nuevoLote.precioCompra && this.nuevoLote.precioCompra > this.producto.precioVenta) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia de Precios',
        detail: `El precio de compra del nuevo lote (${this.nuevoLote.precioCompra}) es mayor al precio de venta actual (${this.producto.precioVenta}). Esto resultará en pérdidas.`,
        life: 10000
      });
      // No retornamos false para permitir la creación, solo es una advertencia
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
  getFechaVencimientoClass(fecha: string | undefined): string {
    if (!fecha) return 'fecha-sin-vencimiento';
    
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

  onImagenSeleccionada(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imagenSeleccionada = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagenPreviewEdicion = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onImageError(event: any) {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement && !imgElement.src.includes('placeholder-image.webp')) {
      imgElement.src = '/placeholder-image.webp';
    }
  }
}
