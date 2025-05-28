import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
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
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ProductoDto, VentaDto, ClienteDto, UsuarioDto, CantidadDto, CreditoDto, ComboDto, PromocionDto, DescuentoDto } from 'src/models';
import { ProductoService } from '../../../services/producto.service';
import { VentaService } from '../../../services/venta.service';
import { CreditoService } from 'src/services/credito.service';
import { OfertaService, ResponseListadoCombos } from 'src/services/oferta.service';
import { HeaderComponent } from '../header/header.component';
import { forkJoin, Observable } from 'rxjs';
import { Router, NavigationStart } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { CanComponentDeactivate } from '../../guards/can-deactivate.guard';

// Interfaz para los items de la venta con información de ofertas
interface ItemVenta extends CantidadDto {
  precioOriginal: number;
  precioConDescuento: number;
  tieneOferta: boolean;
  tipoOferta?: 'combo' | 'promocion' | 'descuento';
  nombreOferta?: string;
  porcentajeDescuento?: number;
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
    PaginatorModule,
    TooltipModule,
    CommonModule,
    HeaderComponent,
    ConfirmDialogModule
  ],
  templateUrl: './nuevaventa.component.html',
  styleUrl: './nuevaventa.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class NuevaventaComponent implements OnInit, OnDestroy, CanComponentDeactivate {
  productoSeleccionado: ProductoDto | null = null;
  cantidades: ItemVenta[] = [];
  productosFiltrados: ProductoDto[] = [];
  productos: ProductoDto[] = [];
  
  // Control de navegación y confirmación
  mostrarDialogoConfirmacion: boolean = false;
  rutaNavegacionPendiente: string | null = null;
  navigationSubscription: Subscription | null = null;
  
  // Escáner físico USB
  escanerActivo: boolean = false;
  codigoBarrasBuffer: string = '';
  ultimoTiempo: number = 0;
  private readonly TIEMPO_LIMITE_CARACTER = 50; // ms entre caracteres del escáner
  
  // Ofertas disponibles
  combos: ComboDto[] = [];
  promociones: PromocionDto[] = [];
  descuentos: DescuentoDto[] = [];
    displayDialog: boolean = false;
  creditoSeleccionado: Pick<CreditoDto, 'id' | 'precioTotal' | 'cliente' | 'maximo' | 'minimo' | 'pagoHastaAhora'> | null = null;
  creditos: Pick<CreditoDto, 'id' | 'precioTotal' | 'cliente' | 'maximo' | 'minimo' | 'pagoHastaAhora'>[] = [];
  creditosFiltrados: Pick<CreditoDto, 'id' | 'precioTotal' | 'cliente' | 'maximo' | 'minimo' | 'pagoHastaAhora'>[] = [];
  formaPagoSeleccionada: string = '';
  totalRecords: number = 0;

  formasPago = [
    { label: 'Efectivo', value: 'EFECTIVO' },
    { label: 'Crédito', value: 'CREDITO' },
    { label: 'Débito', value: 'DEBITO' },
    { label: 'Fiado', value: 'FIADO' }
  ];  constructor(
    private productoService: ProductoService,
    private ventaService: VentaService,
    private creditoService: CreditoService,
    private ofertaService: OfertaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) { }ngOnInit() {
    this.cargarProductos();
    this.cargarOfertas();
  }

  ngOnDestroy() {
    // Limpieza si es necesaria
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  // Implementación del guard de navegación
  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.hayProductosEnVenta()) {
      return new Promise<boolean>((resolve) => {
        this.confirmationService.confirm({
          message: '¿Está seguro que desea salir? Si sale de esta página, perderá todos los productos agregados a la venta actual.',
          header: 'Confirmar salida',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: 'Sí, salir',
          rejectLabel: 'No, quedarme',
          closable: false,
          defaultFocus: 'reject',
          accept: () => {
            resolve(true);
          },
          reject: () => {
            resolve(false);
          }
        });
      });
    }
    return true;
  }

  // Detector de cierre de ventana
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent) {
    if (this.hayProductosEnVenta()) {
      event.preventDefault();
      event.returnValue = '';
      return '';
    }
    return undefined;
  }

  // Método para verificar si hay productos en la venta actual
  hayProductosEnVenta(): boolean {
    return this.cantidades.length > 0;
  }

  // Método para confirmar la navegación
  confirmarNavegacion() {
    this.mostrarDialogoConfirmacion = false;
    if (this.rutaNavegacionPendiente) {
      this.router.navigateByUrl(this.rutaNavegacionPendiente);
      this.rutaNavegacionPendiente = null;
    }
  }

  // Método para cancelar la navegación
  cancelarNavegacion() {
    this.mostrarDialogoConfirmacion = false;
    this.rutaNavegacionPendiente = null;
  }

  // ==================== CARGA DE DATOS ====================

  cargarOfertas() {
    // Cargar combos
    this.ofertaService.listarCombos().subscribe({
      next: (response) => {
        this.combos = response.combos.filter(combo => this.esOfertaVigente(combo));
      },
      error: (error) => console.error('Error al cargar combos:', error)
    });

    // Cargar promociones
    this.ofertaService.listarPromociones().subscribe({
      next: (response) => {
        this.promociones = response.promociones.filter(promo => this.esOfertaVigente(promo));
      },
      error: (error) => console.error('Error al cargar promociones:', error)
    });

    // Cargar descuentos
    this.ofertaService.listarDescuentos().subscribe({
      next: (response) => {
        this.descuentos = response.descuentos.filter(desc => this.esOfertaVigente(desc));
      },
      error: (error) => console.error('Error al cargar descuentos:', error)
    });
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

  // ==================== LÓGICA DE OFERTAS ====================

  esOfertaVigente(oferta: ComboDto | PromocionDto | DescuentoDto): boolean {
    const ahora = new Date();
    const inicio = new Date(oferta.inicio);
    const fin = new Date(oferta.fin);
    return oferta.activo && ahora >= inicio && ahora <= fin;
  }
  aplicarOfertas() {
    // Primero resetear todas las ofertas
    this.cantidades.forEach(item => {
      item.precioOriginal = item.producto.precioVenta * item.cantidad;
      item.precioConDescuento = item.producto.precioVenta * item.cantidad;
      item.tieneOferta = false;
      item.tipoOferta = undefined;
      item.nombreOferta = undefined;
      item.porcentajeDescuento = undefined;
    });

    // Aplicar ofertas en orden de prioridad
    this.aplicarDescuentos();
    this.aplicarPromociones();
    this.aplicarCombos();
  }
  aplicarDescuentos() {
    this.cantidades.forEach(item => {
      const descuento = this.descuentos.find(d => d.producto.id === item.producto.id);
      if (descuento) {
        const precioUnitarioOriginal = item.producto.precioVenta;
        const precioUnitarioConDescuento = precioUnitarioOriginal * (1 - descuento.descuento / 100);
        
        item.precioOriginal = precioUnitarioOriginal * item.cantidad;
        item.precioConDescuento = precioUnitarioConDescuento * item.cantidad;
        item.tieneOferta = true;
        item.tipoOferta = 'descuento';
        item.nombreOferta = `Descuento ${descuento.descuento}%`;
        item.porcentajeDescuento = descuento.descuento;
      }
    });
  }
  aplicarPromociones() {
    this.promociones.forEach(promocion => {
      const itemsPromocion = this.cantidades.filter(item => item.producto.id === promocion.producto.id);
      
      itemsPromocion.forEach(item => {
        if (item.cantidad >= promocion.descuento) {
          // Número de grupos completos de la promoción (ej: para 3x2, cuántos grupos de 3 hay)
          const gruposCompletos = Math.floor(item.cantidad / promocion.descuento);
          // Productos sueltos que no forman un grupo completo
          const productosRestantes = item.cantidad % promocion.descuento;
          
          // En cada grupo completo, cobras (promocion.descuento - 1) productos
          // Ejemplo: en 3x2, por cada grupo de 3 cobras 2
          const productosCobrados = (gruposCompletos * (promocion.descuento - 1)) + productosRestantes;
          const precioPromo = productosCobrados * item.producto.precioVenta;
          
          item.precioOriginal = item.producto.precioVenta * item.cantidad;
          item.precioConDescuento = precioPromo;
          item.tieneOferta = true;
          item.tipoOferta = 'promocion';
          item.nombreOferta = `Promoción ${promocion.descuento}x${promocion.descuento - 1}`;
        }
      });
    });
  }aplicarCombos() {
    // Obtener productos únicos en la venta
    const productosUnicos = [...new Set(this.cantidades.map(item => item.producto.id!))];
    
    // Para cada producto único, verificar combos
    productosUnicos.forEach(productoId => {
      this.ofertaService.getCombosByProducto(productoId).subscribe({
        next: (response: ResponseListadoCombos) => {
          const combosDelProducto = response.combos.filter(combo => this.esOfertaVigente(combo));
          
          combosDelProducto.forEach((combo: ComboDto) => {
            // Verificar si todos los productos del combo están en la venta
            const productosDelCombo = combo.productos.map((p: any) => p.id);
            const productosEnVenta = this.cantidades.map(c => c.producto.id);
            
            const tieneeTodosLosProductos = productosDelCombo.every((idProducto: any) => 
              productosEnVenta.includes(idProducto)
            );
            
            if (tieneeTodosLosProductos) {
              // Obtener todos los items del combo
              const itemsDelCombo = this.cantidades.filter(c => 
                productosDelCombo.includes(c.producto.id)
              );
              
              // Encontrar la cantidad mínima común para aplicar el combo
              const cantidadMinima = Math.min(...itemsDelCombo.map(c => c.cantidad));
              
              if (cantidadMinima > 0) {
                // Aplicar descuento a todos los productos del combo
                itemsDelCombo.forEach(item => {
                  const precioUnitarioOriginal = item.producto.precioVenta;
                  const precioUnitarioConDescuento = precioUnitarioOriginal * (1 - combo.descuento / 100);
                  
                  const precioOriginalTotal = precioUnitarioOriginal * item.cantidad;
                  const precioConCombo = (precioUnitarioConDescuento * cantidadMinima) + 
                                        (precioUnitarioOriginal * (item.cantidad - cantidadMinima));
                  
                  // Solo aplicar si es mejor que la oferta actual
                  if (!item.tieneOferta || item.precioConDescuento > precioConCombo) {
                    item.precioOriginal = precioOriginalTotal;
                    item.precioConDescuento = precioConCombo;
                    item.tieneOferta = true;
                    item.tipoOferta = 'combo';
                    item.nombreOferta = combo.descripcion;
                    item.porcentajeDescuento = combo.descuento;
                  }
                });
              }
            }
          });
        },
        error: (error: any) => console.error('Error al cargar combos del producto:', error)
      });
    });
  }

  // ==================== FUNCIONES AUXILIARES ====================

  onFormaPagoChange() {
    if (this.formaPagoSeleccionada === 'FIADO') {
      this.cargarCreditos();
    } else {
      this.creditoSeleccionado = null;
    }
  }

  getPrecioVenta(productoId: number): number | undefined {
    return this.productos.find(p => p.id === productoId)?.precioVenta;
  }
  getPrecioFinal(item: ItemVenta): number {
    return item.tieneOferta ? item.precioConDescuento : item.producto.precioVenta * item.cantidad;
  }

  // ==================== LÓGICA DE CRÉDITOS ====================

  /**
   * Filtra los clientes basándose en el texto de búsqueda
   */
  filtrarClientes(event: { query: string }) {
    const query = event.query.toLowerCase();
    this.creditosFiltrados = this.creditos.filter(credito =>
      credito.cliente.nombre.toLowerCase().includes(query)
    );
  }

  /**
   * Calcula el dinero disponible que puede gastar un cliente
   */
  calcularDineroDisponible(credito: Pick<CreditoDto, 'maximo' | 'pagoHastaAhora' | 'precioTotal'>): number {
    const deudaActual = credito.precioTotal;
    return Math.max(0, credito.maximo - deudaActual);
  }
  /**
   * Verifica si el cliente puede realizar la compra sin superar su límite de crédito
   */
  puedeRealizarCompra(credito: Pick<CreditoDto, 'maximo' | 'pagoHastaAhora' | 'precioTotal'>): boolean {
    const totalVenta = this.calcularTotal();
    const dineroDisponible = this.calcularDineroDisponible(credito);
    return totalVenta <= dineroDisponible;
  }

  /**
   * Verifica si el total de la venta supera el crédito mínimo requerido
   */
  superaCreditoMinimo(credito: Pick<CreditoDto, 'minimo'>): boolean {
    const totalVenta = this.calcularTotal();
    return totalVenta >= credito.minimo;
  }

  /**
   * Verifica si el cliente puede realizar la compra (supera mínimo y no excede máximo)
   */
  puedeComprarConCredito(credito: Pick<CreditoDto, 'maximo' | 'minimo' | 'pagoHastaAhora' | 'precioTotal'>): boolean {
    return this.puedeRealizarCompra(credito) && this.superaCreditoMinimo(credito);
  }
  /**
   * Obtiene el texto descriptivo del crédito disponible para mostrar en el dropdown
   */
  getTextoCredito(credito: Pick<CreditoDto, 'cliente' | 'maximo' | 'minimo' | 'pagoHastaAhora' | 'precioTotal'>): string {
    const dineroDisponible = this.calcularDineroDisponible(credito);
    const deudaActual = credito.precioTotal - credito.pagoHastaAhora;
    return `${credito.cliente.nombre} - Disponible: $${dineroDisponible.toFixed(2)} (Deuda: $${deudaActual.toFixed(2)})`;
  }

  /**
   * Verifica si la forma de pago es FIADO
   */
  esPagoFiado(): boolean {
    return this.formaPagoSeleccionada === 'FIADO';
  }

  filtrarProductos(event: { query: string }) {
    const query = event.query.toLowerCase();

    // Matches exactos de códigos de barras
    const matchesExactos = this.productos.filter(producto =>
      producto.codigoDeBarra.toLowerCase() === query && producto.activo
    );

    if (matchesExactos.length > 0) {
      this.productosFiltrados = matchesExactos;
      return;
    }

    // Sino, busca por inicio de código o nombre
    this.productosFiltrados = this.productos.filter(producto =>
      producto.activo && (
        producto.codigoDeBarra.toLowerCase().startsWith(query) ||
        producto.nombre.toLowerCase().includes(query)
      )
    );
  }

  agregarALista(event: { value: ProductoDto }) {
    const producto = event.value;
    const itemExistente = this.cantidades.find(c => c.producto.id === producto.id);
    
    if (itemExistente) {
      itemExistente.cantidad++;
    } else {
      const nuevoItem: ItemVenta = {
        id: null,
        cantidad: 1,
        precioActual: producto.precioVenta,
        precioOriginal: producto.precioVenta,
        precioConDescuento: producto.precioVenta,
        tieneOferta: false,
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
      this.cantidades.push(nuevoItem);
      this.totalRecords++;
    }
    
    // Aplicar ofertas después de agregar producto
    this.aplicarOfertas();
    this.productoSeleccionado = null;
  }

  calcularCantidadTotal(): number {
    return this.cantidades.reduce((sum, c) => sum + c.cantidad, 0);
  }

  calcularTotal(): number {
    return this.cantidades.reduce((total, item) => 
      total + this.getPrecioFinal(item), 0
    );
  }

  getTotalAhorro(): number {
    return this.cantidades.reduce((ahorro, item) => {
      if (item.tieneOferta) {
        return ahorro + (item.precioOriginal - this.getPrecioFinal(item));
      }
      return ahorro;
    }, 0);
  }

  eliminarProducto(item: ItemVenta) {
    const index = this.cantidades.findIndex(c => c.producto.id === item.producto.id);
    if (index !== -1) {
      this.cantidades = this.cantidades.filter((_, i) => i !== index);
      this.totalRecords--;
      // Reaplicar ofertas después de eliminar
      this.aplicarOfertas();
    }
  }

  // ==================== VENTA ====================

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
    // Validación de forma de pago
    if (!this.formaPagoSeleccionada) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Debe seleccionar una forma de pago'
      });
      return;
    }

    // Validación de productos en la venta
    if (this.cantidades.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No hay productos en la venta'
      });
      return;
    }    // Validaciones específicas para pago FIADO
    if (this.formaPagoSeleccionada === 'FIADO') {
      if (!this.creditoSeleccionado) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Debe seleccionar un cliente para el pago fiado'
        });
        return;
      }

      // Verificar que el total supere el crédito mínimo
      if (!this.superaCreditoMinimo(this.creditoSeleccionado)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Monto insuficiente',
          detail: `El total de la venta ($${this.calcularTotal().toFixed(2)}) debe ser mayor a $${this.creditoSeleccionado.minimo.toFixed(2)} para compras fiadas`
        });
        return;
      }

      // Verificar que el cliente puede realizar la compra sin superar su límite
      if (!this.puedeRealizarCompra(this.creditoSeleccionado)) {
        const dineroDisponible = this.calcularDineroDisponible(this.creditoSeleccionado);
        const totalVenta = this.calcularTotal();
        this.messageService.add({
          severity: 'error',
          summary: 'Límite de crédito excedido',
          detail: `El cliente ${this.creditoSeleccionado.cliente.nombre} solo puede gastar $${dineroDisponible.toFixed(2)} pero el total de la venta es $${totalVenta.toFixed(2)}`
        });
        return;
      }
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
        precioActual: this.getPrecioFinal(c) / c.cantidad, // Precio unitario con descuento
        producto: {
          id: c.producto.id,
          nombre: c.producto.nombre,
          precioVenta: c.producto.precioVenta,
          codigoDeBarra: c.producto.codigoDeBarra
        }
      })),
      activo: true,
      finalizada: true
    };    this.ventaService.crearVenta(venta as VentaDto).subscribe({
      next: (response) => {        // Verificar si la respuesta contiene un error
        if (response && typeof response === 'object' && 'error' in response) {
          const errorCode = response.error;
          if (errorCode === -1) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Debe seleccionar un cliente válido para el pago fiado'
            });
          } else if (errorCode === -2) {
            this.messageService.add({
              severity: 'error',
              summary: 'Límite de crédito excedido',
              detail: 'El cliente no puede realizar esta compra. Límite de crédito excedido'
            });
          } else if (errorCode === -3) {
            this.messageService.add({
              severity: 'error',
              summary: 'Monto insuficiente',
              detail: 'El total de la venta no supera el mínimo requerido para compras fiadas'
            });
          }
          return;
        }
        
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
          // Manejar errores HTTP específicos
        if (error.status === 400 && error.error && typeof error.error === 'object') {
          if (error.error.error === -1) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Debe seleccionar un cliente válido para el pago fiado'
            });
          } else if (error.error.error === -2) {
            this.messageService.add({
              severity: 'error',
              summary: 'Límite de crédito excedido',
              detail: 'El cliente no puede realizar esta compra. El monto excede el límite de crédito disponible'
            });
          } else if (error.error.error === -3) {
            this.messageService.add({
              severity: 'error',
              summary: 'Monto insuficiente',
              detail: 'El total de la venta no supera el mínimo requerido para compras fiadas'
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al crear la venta'
            });
          }
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear la venta'
          });
        }
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
  // ==================== ESCÁNER FÍSICO USB ====================

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.escanerActivo) return;

    const tiempoActual = Date.now();
    
    // Si el tiempo entre caracteres es muy largo, reiniciar el buffer
    if (tiempoActual - this.ultimoTiempo > this.TIEMPO_LIMITE_CARACTER) {
      this.codigoBarrasBuffer = '';
    }
    
    this.ultimoTiempo = tiempoActual;

    // Si es Enter, procesar el código de barras
    if (event.key === 'Enter') {
      event.preventDefault();
      if (this.codigoBarrasBuffer.length > 0) {
        this.procesarCodigoBarras(this.codigoBarrasBuffer.trim());
        this.codigoBarrasBuffer = '';
      }
      return;
    }

    // Agregar caracteres alfanuméricos al buffer
    if (event.key.length === 1 && /[a-zA-Z0-9]/.test(event.key)) {
      event.preventDefault();
      this.codigoBarrasBuffer += event.key;
    }
  }

  toggleEscanerFisico() {
    this.escanerActivo = !this.escanerActivo;
    
    if (this.escanerActivo) {
      this.messageService.add({
        severity: 'info',
        summary: 'Escáner Activado',
        detail: 'Escanee productos con su lector de códigos',
        life: 3000
      });
    } else {
      this.messageService.add({
        severity: 'info',
        summary: 'Escáner Desactivado',
        detail: 'Modo escáner desactivado',
        life: 3000
      });
      this.codigoBarrasBuffer = '';
    }
  }

  private procesarCodigoBarras(codigoBarras: string) {
    this.productoService.buscarPorCodigoBarras(codigoBarras).subscribe({
      next: (producto) => {
        if (producto) {
          this.agregarALista({ value: producto });
          
          this.messageService.add({
            severity: 'success',
            summary: 'Producto Agregado',
            detail: `${producto.nombre} agregado a la venta`,
            life: 2000
          });
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'Producto No Encontrado',
            detail: `No se encontró producto con código: ${codigoBarras}`,
            life: 4000
          });
        }
      },
      error: (error) => {
        console.error('Error al buscar producto:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al buscar el producto escaneado',
          life: 4000
        });
      }
    });
  }

}

