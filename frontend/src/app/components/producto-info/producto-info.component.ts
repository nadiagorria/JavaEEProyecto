import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';   
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
import { SecurityService } from 'src/services/security.service';
import { BarcodeScannerService } from 'src/services/barcode-scanner.service';
import { ProductoDto } from 'src/models/producto.dto';
import { LoteDto } from 'src/models/lote.dto';
import { CategoriaDto } from 'src/models/categoria.dto';
import { ProveedorDto } from 'src/models/proveedor.dto';
import { ActivatedRoute, Router } from '@angular/router';
import { FileUploadModule } from 'primeng/fileupload';

interface EditandoProducto {
  id: number | null;
  nombre: string;
  codigoDeBarra: string;
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
        private confirmationService: ConfirmationService,
        private securityService: SecurityService,
        private barcodeScannerService: BarcodeScannerService
      ) { }

  producto?: ProductoDto;
  error: string = '';
  loading: boolean = true;
  imagenUrl: string = '';
  cacheImagenes = new Map<number, string>();  // Edit modal properties
  mostrarModalEditar: boolean = false;
  editandoProducto: EditandoProducto = {
    id: null,
    nombre: '',
    codigoDeBarra: '',
    precioVenta: 0,
    stockMin: 0,
    categoriaId: null,
    proveedorId: null
  };
  categorias: CategoriaDto[] = [];  proveedores: ProveedorDto[] = [];
    
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


  isAdminSupremo(): boolean {
    const roles = this.securityService.getUserRoles();
    
    if (!roles || !Array.isArray(roles)) {
      return false;
    }
    

    const hasAdminRole = roles.includes('ADMIN');
    const hasCajeroRole = roles.includes('CAJERO');
    
    return hasAdminRole && !hasCajeroRole;
  }


  mostrarModalAgregarLote: boolean = false;
  nuevoLote: {
    numeLote: string;
    stock: number;
    fechaVencimiento: string | undefined;
    precioCompra: number;
  } = {
    numeLote: '',
    stock: 0,
    fechaVencimiento: undefined, 
    precioCompra: 0
  };
  minFechaVencimiento: string = '';


  mostrarModalModificarStock: boolean = false;
  nuevoStockTotal: number = 0;
  stockOriginal: number = 0;

  imagenSeleccionada: File | null = null;
  imagenPreviewEdicion: string | null = null;
  private barcodeScannerSubscription: any;

  ngOnInit() {
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


    this.barcodeScannerSubscription = this.barcodeScannerService.lastScannedCode$.subscribe(code => {
      if (code && this.mostrarModalEditar) {
        this.editandoProducto.codigoDeBarra = code;
      }
    });
  }cargarProducto(id: number) {
    this.loading = true;
    this.productoService.obtenerProducto(id).subscribe({      next: (response) => {
        console.log('Respuesta del backend:', response);
        console.log('Lotes del producto:', response.lotes);
        this.producto = response;
        
        if (this.producto.lotes) {
          this.producto.lotes.sort((a, b) => {
            if (!a.fechaVencimiento) return 1;
            if (!b.fechaVencimiento) return -1;
            
            const fechaA = new Date(a.fechaVencimiento);
            const fechaB = new Date(b.fechaVencimiento);
            return fechaA.getTime() - fechaB.getTime();
          });
        }
        
        this.loading = false;
        
        if (this.producto.id) {
          this.cargarImagenProducto(this.producto.id);
        }

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
  abrirModalEditar(): void {
    if (!this.producto) return;
    
    if (this.categorias.length === 0) {
      this.cargarCategorias();
    }
    
    if (this.proveedores.length === 0) {
      this.cargarProveedores();
    }
      this.editandoProducto = {
      id: this.producto.id,
      nombre: this.producto.nombre,
      codigoDeBarra: this.producto.codigoDeBarra,
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
        detail: 'No se puede procesar la edición del producto. Todos los campos deben ser válidos.'
      });
      return;
    }

    console.log('Guardando producto con categoriaId:', this.editandoProducto.categoriaId);
    console.log('Guardando producto con proveedorId:', this.editandoProducto.proveedorId);

    const categoriaSeleccionada = this.categorias.find(c => c.id === this.editandoProducto.categoriaId);
    const proveedorSeleccionado = this.proveedores.find(p => p.id === this.editandoProducto.proveedorId);

    console.log('Categoría encontrada:', categoriaSeleccionada);
    console.log('Proveedor encontrado:', proveedorSeleccionado);    
    const productoParaEditar: ProductoDto = {
      ...this.producto!,
      id: this.editandoProducto.id,
      nombre: this.editandoProducto.nombre!,
      codigoDeBarra: this.editandoProducto.codigoDeBarra!,
      precioVenta: this.editandoProducto.precioVenta!,
      stockMin: this.editandoProducto.stockMin!,
      categoria: categoriaSeleccionada || null,
      proveedor: proveedorSeleccionado || null
    };

    console.log('Producto para editar:', productoParaEditar);

    this.productoService.editarProducto(productoParaEditar).subscribe({
      next: () => {
        if (this.imagenSeleccionada) {
          this.productoService.actualizarImagenProducto(this.editandoProducto.id!, this.imagenSeleccionada).subscribe({
            next: () => {

              if (this.imagenPreviewEdicion) {

                this.cacheImagenes.delete(this.editandoProducto.id!);

                this.imagenUrl = this.imagenPreviewEdicion;

                this.cacheImagenes.set(this.editandoProducto.id!, this.imagenPreviewEdicion);
              }
              
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

    this.barcodeScannerService.deactivateScanner();
    

    if (this.producto!.id !== null && !this.imagenSeleccionada) {
      this.cargarProducto(this.producto!.id);
    } else if (this.producto!.id !== null && this.imagenSeleccionada) {

      this.productoService.obtenerProducto(this.producto!.id).subscribe({
        next: (response) => {

          const imagenActual = this.imagenUrl;
          this.producto = response;
          this.imagenUrl = imagenActual;
        },
        error: (error) => {
          console.error('Error al recargar datos del producto:', error);
        }
      });
    }
    this.imagenSeleccionada = null;
    this.imagenPreviewEdicion = null;
  }

  private validarFormularioEdicion(): boolean {
    return !!(
      this.editandoProducto.nombre &&
      this.editandoProducto.codigoDeBarra &&
      this.editandoProducto.precioVenta !== undefined &&
      this.editandoProducto.precioVenta > 0 &&
      this.editandoProducto.stockMin !== undefined &&
      this.editandoProducto.stockMin >= 0 &&
      this.editandoProducto.codigoDeBarra.trim() !== ''
    );
  }

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

  confirmarEliminarLote(loteId: number) {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar este lote? Esta acción no se puede deshacer.',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.eliminarLote(loteId);
      }
    });
  }

  eliminarLote(loteId: number) {
    if (!this.producto || this.producto.id === null) return;
    this.loteService.eliminarLote(loteId).subscribe({
      next: () => {
        this.producto!.lotes = this.producto!.lotes.filter(l => l.id !== loteId);
        if (this.producto!.id !== null) {
          this.cargarProducto(this.producto!.id);
        }
      },      error: (err) => {
        console.error('Error al eliminar lote:', err);
        let errorMessage = 'Error al eliminar el lote';
        
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
    }    
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
        const idMatch = response.match(/ID: (\d+)/);
        const idLote = idMatch ? idMatch[1] : 'desconocido';
        
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Lote #${idLote} agregado correctamente`
        });
        
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
  }  
  
  private resetearFormularioLote(): void {
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


    if (this.nuevoLote.precioCompra === undefined || this.nuevoLote.precioCompra < 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'El precio de compra debe ser un valor válido'
      });
      return false;
    }    

    if (this.producto && this.nuevoLote.precioCompra && this.nuevoLote.precioCompra > this.producto.precioVenta) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia de Precios',
        detail: `El precio de compra del nuevo lote (${this.nuevoLote.precioCompra}) es mayor al precio de venta actual (${this.producto.precioVenta}). Esto resultará en pérdidas.`,
        life: 10000
      });
    }

    return true;
  }

  ngOnDestroy(): void {
    this.limpiarCacheImagenes();
    

    if (this.barcodeScannerSubscription) {
      this.barcodeScannerSubscription.unsubscribe();
    }
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


  abrirModalModificarStock(): void {
    if (!this.producto) return;
    
    this.stockOriginal = this.producto.stockTotal;
    this.nuevoStockTotal = this.producto.stockTotal;
    this.mostrarModalModificarStock = true;
  }

  modificarStockTotal(): void {
    if (!this.producto || !this.producto.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se puede modificar el stock del producto'
      });
      return;
    }

    if (this.nuevoStockTotal < 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El stock total no puede ser negativo'
      });
      return;
    }

    this.productoService.modificarStockTotal(this.producto.id, this.nuevoStockTotal).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Stock total modificado correctamente'
        });
        

        if (this.producto) {
          this.producto.stockTotal = this.nuevoStockTotal;
        }
        
        this.mostrarModalModificarStock = false;
      },
      error: (error) => {
        console.error('Error al modificar stock:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error || 'Error al modificar el stock total'
        });
      }
    });
  }

  onImagenSeleccionada(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imagenSeleccionada = file;
      
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


  activarEscanerCodigoBarras(): void {
    this.barcodeScannerService.activateScanner();
    this.messageService.add({
      severity: 'info',
      summary: 'Escáner Activado',
      detail: 'Escanee un código de barras para capturarlo',
      life: 3000
    });
  }


  desactivarEscaner(): void {
    this.barcodeScannerService.deactivateScanner();
  }
}
