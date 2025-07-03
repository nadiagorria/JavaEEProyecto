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
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import {
  ProductoDto,
  VentaDto,
  ClienteDto,
  UsuarioDto,
  CantidadDto,
  CreditoDto,
  ComboDto,
  PromocionDto,
  DescuentoDto,
} from 'src/models';
import { ProductoService } from '../../../services/producto.service';
import { VentaService } from '../../../services/venta.service';
import { CreditoService } from 'src/services/credito.service';
import {
  OfertaService,
  ResponseListadoCombos,
} from 'src/services/oferta.service';
import { NotificacionService } from 'src/services/notificacion.service';
import { HeaderComponent } from '../header/header.component';
import { SeleccionProductoDialogComponent } from '../seleccion-producto-dialog/seleccion-producto-dialog.component';
import { forkJoin, Observable } from 'rxjs';
import { Router, NavigationStart } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { CanComponentDeactivate } from '../../guards/can-deactivate.guard';

interface ItemVenta extends CantidadDto {
  precioOriginal: number;
  precioConDescuento: number;
  tieneOferta: boolean;
  tipoOferta?: 'combo' | 'promocion' | 'descuento';
  nombreOferta?: string;
  porcentajeDescuento?: number;
  producto: Pick<
    ProductoDto,
    'id' | 'nombre' | 'precioVenta' | 'codigoDeBarra' | 'stockTotal'
  >;
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
    ToastModule,
    CommonModule,
    HeaderComponent,
    ConfirmDialogModule,
    SeleccionProductoDialogComponent,
  ],
  templateUrl: './nuevaventa.component.html',
  styleUrl: './nuevaventa.component.scss',
  providers: [MessageService, ConfirmationService],
})
export class NuevaventaComponent
  implements OnInit, OnDestroy, CanComponentDeactivate
{
  productoSeleccionado: ProductoDto | null = null;
  cantidades: ItemVenta[] = [];
  productosFiltrados: ProductoDto[] = [];
  productos: ProductoDto[] = [];

  mostrarDialogoConfirmacion: boolean = false;
  rutaNavegacionPendiente: string | null = null;
  navigationSubscription: Subscription | null = null;

  private cantidadAnterior: Map<number, number> = new Map();

  escanerActivo: boolean = false;
  codigoBarrasBuffer: string = '';
  ultimoTiempo: number = 0;
  private readonly TIEMPO_LIMITE_CARACTER = 50;
  combos: ComboDto[] = [];
  promociones: PromocionDto[] = [];
  descuentos: DescuentoDto[] = [];
  displayDialog: boolean = false;
  procesandoVenta: boolean = false;

  displaySeleccionProducto: boolean = false;
  productosDuplicados: ProductoDto[] = [];
  codigoBarrasEscaneado: string = '';

  creditoSeleccionado: Pick<
    CreditoDto,
    'id' | 'precioTotal' | 'cliente' | 'maximo' | 'minimo' | 'pagoHastaAhora'
  > | null = null;
  creditos: Pick<
    CreditoDto,
    'id' | 'precioTotal' | 'cliente' | 'maximo' | 'minimo' | 'pagoHastaAhora'
  >[] = [];
  creditosFiltrados: Pick<
    CreditoDto,
    'id' | 'precioTotal' | 'cliente' | 'maximo' | 'minimo' | 'pagoHastaAhora'
  >[] = [];
  formaPagoSeleccionada: string = '';
  totalRecords: number = 0;

  formasPago = [
    { label: 'Efectivo', value: 'EFECTIVO' },
    { label: 'Crédito', value: 'CREDITO' },
    { label: 'Débito', value: 'DEBITO' },
    { label: 'Fiado', value: 'FIADO' },
  ];
  constructor(
    private productoService: ProductoService,
    private ventaService: VentaService,
    private creditoService: CreditoService,
    private ofertaService: OfertaService,
    private notificacionService: NotificacionService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}
  ngOnInit() {
    this.cargarProductos();
    this.cargarOfertas();
    this.cargarCreditos();
  }

  ngOnDestroy() {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.hayProductosEnVenta()) {
      return new Promise<boolean>((resolve) => {
        this.confirmationService.confirm({
          message:
            '¿Está seguro que desea salir? Si sale de esta página, perderá todos los productos agregados a la venta actual.',
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
          },
        });
      });
    }
    return true;
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent) {
    if (this.hayProductosEnVenta()) {
      event.preventDefault();
      event.returnValue = '';
      return '';
    }
    return undefined;
  }

  hayProductosEnVenta(): boolean {
    return this.cantidades.length > 0;
  }

  confirmarNavegacion() {
    this.mostrarDialogoConfirmacion = false;
    if (this.rutaNavegacionPendiente) {
      this.router.navigateByUrl(this.rutaNavegacionPendiente);
      this.rutaNavegacionPendiente = null;
    }
  }

  cancelarNavegacion() {
    this.mostrarDialogoConfirmacion = false;
    this.rutaNavegacionPendiente = null;
  }

  cargarOfertas() {
    this.ofertaService.listarCombos().subscribe({
      next: (response) => {
        this.combos = response.combos.filter((combo) =>
          this.esOfertaVigente(combo)
        );
      },
      error: (error) => console.error('Error al cargar combos:', error),
    });

    this.ofertaService.listarPromociones().subscribe({
      next: (response) => {
        this.promociones = response.promociones.filter((promo) =>
          this.esOfertaVigente(promo)
        );
      },
      error: (error) => console.error('Error al cargar promociones:', error),
    });

    this.ofertaService.listarDescuentos().subscribe({
      next: (response) => {
        this.descuentos = response.descuentos.filter((desc) =>
          this.esOfertaVigente(desc)
        );
      },
      error: (error) => console.error('Error al cargar descuentos:', error),
    });
  }

  cargarCreditos() {
    this.creditoService.listarCreditos().subscribe({
      next: (response) => {
        this.creditos = response.creditos;
        this.creditosFiltrados = [...this.creditos];
      },
      error: (error) => {
        this.messageService.clear();
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los créditos',
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
        this.messageService.clear();
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los productos',
        });
      },
    });
  }

  esOfertaVigente(oferta: ComboDto | PromocionDto | DescuentoDto): boolean {
    const ahora = new Date();
    const inicio = new Date(oferta.inicio);
    const fin = new Date(oferta.fin);
    return oferta.activo && ahora >= inicio && ahora <= fin;
  }
  aplicarOfertas() {
    this.cantidades.forEach((item) => {
      item.precioOriginal = item.producto.precioVenta * item.cantidad;
      item.precioConDescuento = item.producto.precioVenta * item.cantidad;
      item.tieneOferta = false;
      item.tipoOferta = undefined;
      item.nombreOferta = undefined;
      item.porcentajeDescuento = undefined;
    });

    this.aplicarDescuentos();
    this.aplicarPromociones();
    this.aplicarCombos();
  }
  aplicarDescuentos() {
    this.cantidades.forEach((item) => {
      const descuento = this.descuentos.find(
        (d) => d.producto.id === item.producto.id
      );
      if (descuento) {
        const precioUnitarioOriginal = item.producto.precioVenta;
        const precioUnitarioConDescuento =
          precioUnitarioOriginal * (1 - descuento.descuento / 100);

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
    this.promociones.forEach((promocion) => {
      const itemsPromocion = this.cantidades.filter(
        (item) => item.producto.id === promocion.producto.id
      );

      itemsPromocion.forEach((item) => {
        if (item.cantidad >= promocion.descuento) {
          const gruposCompletos = Math.floor(
            item.cantidad / promocion.descuento
          );

          const productosRestantes = item.cantidad % promocion.descuento;

          const productosCobrados =
            gruposCompletos * (promocion.descuento - 1) + productosRestantes;
          const precioPromo = productosCobrados * item.producto.precioVenta;

          item.precioOriginal = item.producto.precioVenta * item.cantidad;
          item.precioConDescuento = precioPromo;
          item.tieneOferta = true;
          item.tipoOferta = 'promocion';
          item.nombreOferta = `Promoción ${promocion.descuento}x${
            promocion.descuento - 1
          }`;
        }
      });
    });
  }
  aplicarCombos() {
    const productosUnicos = [
      ...new Set(this.cantidades.map((item) => item.producto.id!)),
    ];

    productosUnicos.forEach((productoId) => {
      this.ofertaService.getCombosByProducto(productoId).subscribe({
        next: (response: ResponseListadoCombos) => {
          const combosDelProducto = response.combos.filter((combo) =>
            this.esOfertaVigente(combo)
          );

          combosDelProducto.forEach((combo: ComboDto) => {
            const productosDelCombo = combo.productos.map((p: any) => p.id);
            const productosEnVenta = this.cantidades.map((c) => c.producto.id);

            const tieneeTodosLosProductos = productosDelCombo.every(
              (idProducto: any) => productosEnVenta.includes(idProducto)
            );

            if (tieneeTodosLosProductos) {
              const itemsDelCombo = this.cantidades.filter((c) =>
                productosDelCombo.includes(c.producto.id)
              );

              const cantidadMinima = Math.min(
                ...itemsDelCombo.map((c) => c.cantidad)
              );

              if (cantidadMinima > 0) {
                itemsDelCombo.forEach((item) => {
                  const precioUnitarioOriginal = item.producto.precioVenta;
                  const precioUnitarioConDescuento =
                    precioUnitarioOriginal * (1 - combo.descuento / 100);

                  const precioOriginalTotal =
                    precioUnitarioOriginal * item.cantidad;
                  const precioConCombo =
                    precioUnitarioConDescuento * cantidadMinima +
                    precioUnitarioOriginal * (item.cantidad - cantidadMinima);

                  if (
                    !item.tieneOferta ||
                    item.precioConDescuento > precioConCombo
                  ) {
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
        error: (error: any) =>
          console.error('Error al cargar combos del producto:', error),
      });
    });
  }

  onFormaPagoChange() {
    if (this.formaPagoSeleccionada === 'FIADO') {
      this.cargarCreditos();
    } else {
      this.creditoSeleccionado = null;
    }
  }

  getPrecioVenta(productoId: number): number | undefined {
    return this.productos.find((p) => p.id === productoId)?.precioVenta;
  }
  getPrecioFinal(item: ItemVenta): number {
    return item.tieneOferta
      ? item.precioConDescuento
      : item.producto.precioVenta * item.cantidad;
  }

  filtrarClientes(event: { query: string }) {
    const query = event.query.toLowerCase().trim();

    if (query === '') {
      this.creditosFiltrados = [...this.creditos];
    } else {
      this.creditosFiltrados = this.creditos.filter((credito) =>
        credito.cliente.nombre.toLowerCase().includes(query)
      );
    }
  }

  calcularDineroDisponible(
    credito: Pick<CreditoDto, 'maximo' | 'pagoHastaAhora' | 'precioTotal'>
  ): number {
    const deudaActual = credito.precioTotal;
    return Math.max(0, credito.maximo - deudaActual);
  }
  puedeRealizarCompra(
    credito: Pick<CreditoDto, 'maximo' | 'pagoHastaAhora' | 'precioTotal'>
  ): boolean {
    const totalVenta = this.calcularTotal();
    const dineroDisponible = this.calcularDineroDisponible(credito);
    return totalVenta <= dineroDisponible;
  }

  superaCreditoMinimo(credito: Pick<CreditoDto, 'minimo'>): boolean {
    const totalVenta = this.calcularTotal();
    return totalVenta >= credito.minimo;
  }

  puedeComprarConCredito(
    credito: Pick<
      CreditoDto,
      'maximo' | 'minimo' | 'pagoHastaAhora' | 'precioTotal'
    >
  ): boolean {
    return (
      this.puedeRealizarCompra(credito) && this.superaCreditoMinimo(credito)
    );
  }
  getTextoCredito(
    credito: Pick<
      CreditoDto,
      'cliente' | 'maximo' | 'minimo' | 'pagoHastaAhora' | 'precioTotal'
    >
  ): string {
    const dineroDisponible = this.calcularDineroDisponible(credito);
    const deudaActual = credito.precioTotal - credito.pagoHastaAhora;
    return `${credito.cliente.nombre} - Disponible: $${dineroDisponible.toFixed(
      2
    )} (Deuda: $${deudaActual.toFixed(2)})`;
  }

  esPagoFiado(): boolean {
    return this.formaPagoSeleccionada === 'FIADO';
  }
  filtrarProductos(event: { query: string }) {
    const query = event.query.toLowerCase();

    const matchesExactos = this.productos.filter(
      (producto) =>
        producto.codigoDeBarra.toLowerCase() === query && producto.activo
    );

    if (matchesExactos.length > 0) {
      this.productosFiltrados = matchesExactos;
      return;
    }

    this.productosFiltrados = this.productos.filter(
      (producto) =>
        producto.activo &&
        (producto.codigoDeBarra.toLowerCase().startsWith(query) ||
          producto.nombre.toLowerCase().includes(query))
    );
  }

  tieneStock(producto: ProductoDto): boolean {
    return producto.stockTotal > 0;
  }

  onProductoSelect(event: any): void {
    const producto = event.value;
    if (!this.tieneStock(producto)) {
      event.preventDefault();
      this.messageService.clear();
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin stock',
        detail: `El producto ${producto.nombre} no tiene stock disponible`,
      });
      this.productoSeleccionado = null;
      return;
    }
    this.agregarALista(event);
  }
  agregarALista(event: { value: ProductoDto }) {
    const producto = event.value;
    const itemExistente = this.cantidades.find(
      (c) => c.producto.id === producto.id
    );

    if (itemExistente) {
      const cantidadTotal = itemExistente.cantidad + 1;
      if (cantidadTotal > producto.stockTotal) {
        this.messageService.clear();
        this.messageService.add({
          severity: 'warn',
          summary: 'Stock insuficiente',
          detail: `Solo quedan ${producto.stockTotal} unidades de ${producto.nombre} en stock`,
        });
        return;
      }
      itemExistente.cantidad++;
    } else {
      if (producto.stockTotal < 1) {
        this.messageService.clear();
        this.messageService.add({
          severity: 'warn',
          summary: 'Sin stock',
          detail: `No hay stock disponible de ${producto.nombre}`,
        });
        return;
      }

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
          codigoDeBarra: producto.codigoDeBarra,
          stockTotal: producto.stockTotal,
        },
        venta: {
          id: null,
          fechaVenta: '',
        },
      };
      this.cantidades.push(nuevoItem);
      this.totalRecords++;
    }

    this.aplicarOfertas();
    this.productoSeleccionado = null;
  }

  calcularCantidadTotal(): number {
    return this.cantidades.reduce((sum, c) => sum + c.cantidad, 0);
  }

  calcularTotal(): number {
    return this.cantidades.reduce(
      (total, item) => total + this.getPrecioFinal(item),
      0
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
    const index = this.cantidades.findIndex(
      (c) => c.producto.id === item.producto.id
    );
    if (index !== -1) {
      this.cantidades = this.cantidades.filter((_, i) => i !== index);
      this.totalRecords--;

      this.aplicarOfertas();
    }
  }

  finalizarVenta() {
    if (this.cantidades.length === 0) {
      this.messageService.clear();
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No hay productos en la venta',
      });
      return;
    }
    this.displayDialog = true;
  }
  confirmarVenta() {
    if (this.procesandoVenta) {
      return;
    }

    if (!this.formaPagoSeleccionada) {
      this.messageService.clear();
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Debe seleccionar una forma de pago',
      });
      return;
    }

    if (this.cantidades.length === 0) {
      this.messageService.clear();
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No hay productos en la venta',
      });
      return;
    } 
    
    // Validaciones específicas para pago FIADO
    if (this.formaPagoSeleccionada === 'FIADO') {
      if (!this.creditoSeleccionado) {
        this.messageService.clear();
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Debe seleccionar un cliente para el pago fiado',
        });
        return;
      }

      if (!this.superaCreditoMinimo(this.creditoSeleccionado)) {
        this.messageService.clear();
        this.messageService.add({
          severity: 'error',
          summary: 'Monto insuficiente',
          detail: `El total de la venta ($${this.calcularTotal().toFixed(
            2
          )}) debe ser mayor a $${this.creditoSeleccionado.minimo.toFixed(
            2
          )} para compras fiadas`,
        });
        return;
      }

      if (!this.puedeRealizarCompra(this.creditoSeleccionado)) {
        const dineroDisponible = this.calcularDineroDisponible(
          this.creditoSeleccionado
        );
        const totalVenta = this.calcularTotal();
        this.messageService.clear();
        this.messageService.add({
          severity: 'error',
          summary: 'Límite de crédito excedido',
          detail: `El cliente ${
            this.creditoSeleccionado.cliente.nombre
          } solo puede gastar $${dineroDisponible.toFixed(
            2
          )} pero el total de la venta es $${totalVenta.toFixed(2)}`,
        });
        return;
      }
    }

    const venta: Partial<VentaDto> = {
      total: this.calcularTotal(),
      formaPago: this.formaPagoSeleccionada,
      credito:
        this.formaPagoSeleccionada === 'FIADO'
          ? {
              id: this.creditoSeleccionado!.id,
              precioTotal: this.calcularTotal(),
            }
          : undefined,
      cantidades: this.cantidades.map((c) => ({
        id: null,
        cantidad: c.cantidad,
        precioActual: this.getPrecioFinal(c) / c.cantidad, // Precio unitario con descuento
        producto: {
          id: c.producto.id,
          nombre: c.producto.nombre,
          precioVenta: c.producto.precioVenta,
          codigoDeBarra: c.producto.codigoDeBarra,
        },
      })),
      activo: true,
    };

    this.procesandoVenta = true;

    this.ventaService.crearVenta(venta as VentaDto).subscribe({
      next: (response) => {
        if (response && typeof response === 'object' && 'error' in response) {
          const errorCode = response.error;
          if (errorCode === -1) {
            this.messageService.clear();
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Debe seleccionar un cliente válido para el pago fiado',
            });
          } else if (errorCode === -2) {
            this.messageService.clear();
            this.messageService.add({
              severity: 'error',
              summary: 'Límite de crédito excedido',
              detail:
                'El cliente no puede realizar esta compra. Límite de crédito excedido',
            });
          } else if (errorCode === -3) {
            this.messageService.clear();
            this.messageService.add({
              severity: 'error',
              summary: 'Monto insuficiente',
              detail:
                'El total de la venta no supera el mínimo requerido para compras fiadas',
            });
          }
          this.procesandoVenta = false;
          return;
        }
        this.messageService.clear();
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Venta creada correctamente',
        });

        this.notificacionService.refrescarPostVenta();

        this.cargarProductos();

        this.displayDialog = false;
        this.limpiarVenta();
        this.procesandoVenta = false;
      },
      error: (error) => {
        if (
          error.status === 400 &&
          error.error &&
          typeof error.error === 'object'
        ) {
          if (error.error.error === -1) {
            this.messageService.clear();
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Debe seleccionar un cliente válido para el pago fiado',
            });
          } else if (error.error.error === -2) {
            this.messageService.clear();
            this.messageService.add({
              severity: 'error',
              summary: 'Límite de crédito excedido',
              detail:
                'El cliente no puede realizar esta compra. El monto excede el límite de crédito disponible',
            });
          } else if (error.error.error === -3) {
            this.messageService.clear();
            this.messageService.add({
              severity: 'error',
              summary: 'Monto insuficiente',
              detail:
                'El total de la venta no supera el mínimo requerido para compras fiadas',
            });
          } else {
            this.messageService.clear();
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al crear la venta',
            });
          }
        } else {
          this.messageService.clear();
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear la venta',
          });
        }
        this.procesandoVenta = false;
      },
    });
  }
  limpiarVenta() {
    this.cantidades = [];
    this.totalRecords = 0;
    this.creditoSeleccionado = null;
    this.formaPagoSeleccionada = '';
    this.productoSeleccionado = null;
    this.procesandoVenta = false;
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.escanerActivo) return;

    const tiempoActual = Date.now();

    if (tiempoActual - this.ultimoTiempo > this.TIEMPO_LIMITE_CARACTER) {
      this.codigoBarrasBuffer = '';
    }

    this.ultimoTiempo = tiempoActual;

    if (event.key === 'Enter') {
      event.preventDefault();
      if (this.codigoBarrasBuffer.length > 0) {
        this.procesarCodigoBarras(this.codigoBarrasBuffer.trim());
        this.codigoBarrasBuffer = '';
      }
      return;
    }

    if (event.key.length === 1 && /[a-zA-Z0-9]/.test(event.key)) {
      event.preventDefault();
      this.codigoBarrasBuffer += event.key;
    }
  }
  toggleEscanerFisico() {
    this.escanerActivo = !this.escanerActivo;

    if (this.escanerActivo) {
      this.messageService.clear();
      this.messageService.add({
        severity: 'info',
        summary: 'Escáner Activado',
        detail: 'Modo escáner USB activo. Escanee productos con su lector',
        life: 3000,
      });
    } else {
      this.messageService.clear();
      this.messageService.add({
        severity: 'info',
        summary: '📱 Escáner Desactivado',
        detail: 'Modo escáner desactivado. Use la búsqueda manual',
        life: 3000,
      });
      this.codigoBarrasBuffer = '';
    }
  }
  private procesarCodigoBarras(codigoBarras: string) {
    this.productoService.buscarTodosPorCodigoBarras(codigoBarras).subscribe({
      next: (productos) => {
        if (productos && productos.length > 0) {
          const productosConStock = productos.filter((p) => this.tieneStock(p));

          if (productosConStock.length === 0) {
            this.messageService.clear();
            this.messageService.add({
              severity: 'warn',
              summary: '⚠️ Sin Stock',
              detail: `No hay productos disponibles con stock para el código: ${codigoBarras}`,
              life: 4000,
            });
            return;
          }

          if (productosConStock.length === 1) {
            const producto = productosConStock[0];
            this.agregarProductoDirectamente(producto);
          } else {
            this.mostrarDialogoSeleccion(productos, codigoBarras);
          }
        } else {
          this.messageService.clear();
          this.messageService.add({
            severity: 'warn',
            summary: '❌ Producto No Encontrado',
            detail: `No se encontró producto con código: ${codigoBarras}`,
            life: 4000,
          });
        }
      },
      error: (error) => {
        
        if (error.status === 404) {
          this.messageService.clear();
          this.messageService.add({
            severity: 'warn',
            summary: '❌ Producto No Encontrado',
            detail: `No se encontró producto con código: ${codigoBarras}`,
            life: 4000,
          });
        } else {
          this.messageService.clear();
          this.messageService.add({
            severity: 'error',
            summary: '❌ Error de Conexión',
            detail: 'Error al buscar productos con el código escaneado',
            life: 4000,
          });
        }
      },
    });
  }

  validarYAplicarOfertas(event: any, item: ItemVenta) {
    const nuevaCantidad = event.value;
    const stockDisponible = this.getStockDisponible(item.producto);

    if (nuevaCantidad > stockDisponible) {
      this.messageService.clear();
      this.messageService.add({
        severity: 'warn',
        summary: '⚠️ Cantidad Excedida',
        detail: `${item.producto.nombre}: máximo ${stockDisponible} unidades disponibles (Stock: ${stockDisponible})`,
        life: 3000,
      });

      item.cantidad = stockDisponible;
      return;
    }

    if (nuevaCantidad < 1) {
      this.messageService.clear();
      this.messageService.add({
        severity: 'warn',
        summary: '⚠️ Cantidad Inválida',
        detail: 'La cantidad mínima es 1 unidad',
        life: 2000,
      });
      item.cantidad = 1;
      return;
    }

    this.cantidadAnterior.set(item.producto.id!, nuevaCantidad);

    this.aplicarOfertas();
  }

  getStockDisponible(producto: any): number {
    const productoCompleto = this.productos.find((p) => p.id === producto.id);
    return productoCompleto
      ? productoCompleto.stockTotal
      : producto.stockTotal || 0;
  }

  guardarCantidadAnterior(item: ItemVenta) {
    this.cantidadAnterior.set(item.producto.id!, item.cantidad);
  }
  verificarCambioManual(item: ItemVenta) {
    const cantidadPrevia =
      this.cantidadAnterior.get(item.producto.id!) || item.cantidad;
    const stockDisponible = this.getStockDisponible(item.producto);

    if (
      item.cantidad === stockDisponible &&
      cantidadPrevia === stockDisponible
    ) {
      setTimeout(() => {
        if (item.cantidad === stockDisponible) {
          this.messageService.clear();
          this.messageService.add({
            severity: 'warn',
            summary: '⚠️ Stock Máximo Alcanzado',
            detail: `${item.producto.nombre} ya tiene la cantidad máxima disponible (${stockDisponible} unidades)`,
            life: 3000,
          });
        }
      }, 100);
    }

    this.cantidadAnterior.delete(item.producto.id!);
  }

  onInputKeydown(event: KeyboardEvent, item: ItemVenta) {
    const stockDisponible = this.getStockDisponible(item.producto);

    if (event.key === 'ArrowUp' && item.cantidad >= stockDisponible) {
      event.preventDefault();
      this.messageService.clear();
      this.messageService.add({
        severity: 'warn',
        summary: '⚠️ Stock Máximo Alcanzado',
        detail: `${item.producto.nombre} ya tiene la cantidad máxima disponible (${stockDisponible} unidades)`,
        life: 3000,
      });
    }
  }
  detectarClickIncremento(event: MouseEvent, item: ItemVenta) {
    const target = event.target as HTMLElement;
    const stockDisponible = this.getStockDisponible(item.producto);

    if (
      target &&
      (target.classList.contains('p-inputnumber-button-up') ||
        target.closest('.p-inputnumber-button-up'))
    ) {
      if (item.cantidad >= stockDisponible) {
        setTimeout(() => {
          this.messageService.clear();
          this.messageService.add({
            severity: 'warn',
            summary: '⚠️ Stock Máximo Alcanzado',
            detail: `${item.producto.nombre} ya tiene la cantidad máxima disponible (${stockDisponible} unidades)`,
            life: 3000,
          });
        }, 50);
      }
    }
  }

  private mostrarDialogoSeleccion(
    productos: ProductoDto[],
    codigoBarras: string
  ) {
    this.productosDuplicados = productos;
    this.codigoBarrasEscaneado = codigoBarras;
    this.displaySeleccionProducto = true;

    this.messageService.clear();
    this.messageService.add({
      severity: 'info',
      summary: '🔍 Múltiples Productos',
      detail: `Se encontraron ${productos.length} productos con el código ${codigoBarras}. Seleccione el correcto.`,
      life: 4000,
    });
  }

  private agregarProductoDirectamente(producto: ProductoDto) {
    const itemExistente = this.cantidades.find(
      (item) => item.producto.id === producto.id
    );
    if (itemExistente && itemExistente.cantidad >= producto.stockTotal) {
      this.messageService.clear();
      this.messageService.add({
        severity: 'warn',
        summary: '⚠️ Stock Insuficiente',
        detail: `${producto.nombre} alcanzó el stock máximo disponible (${producto.stockTotal})`,
        life: 3000,
      });
      return;
    }

    this.agregarALista({ value: producto });

    this.messageService.clear();
    this.messageService.add({
      severity: 'success',
      summary: '✅ Producto Agregado',
      detail: `${producto.nombre} agregado a la venta`,
      life: 2000,
    });
  }

  onProductoSeleccionado(producto: ProductoDto) {
    this.displaySeleccionProducto = false;
    this.agregarProductoDirectamente(producto);
  }

  onDialogoSeleccionCerrado() {
    this.displaySeleccionProducto = false;
    this.productosDuplicados = [];
    this.codigoBarrasEscaneado = '';
  }

  onClienteSeleccionado(event: any) {
    this.creditoSeleccionado = event;
  }

  onClienteLimpiado() {
    this.creditoSeleccionado = null;
  }
}
