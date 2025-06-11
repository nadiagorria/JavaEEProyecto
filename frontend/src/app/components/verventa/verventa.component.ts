import { Component, OnInit } from '@angular/core';
import { VentaSimpleDto, CantidadDto, ComboDto, PromocionDto, DescuentoDto } from 'src/models';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { VentaService } from 'src/services/venta.service';
import { SecurityService } from 'src/services/security.service';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-verventa',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    CurrencyPipe,
    TagModule,
    TooltipModule,
    ToastModule,
    HeaderComponent,
    FooterComponent
  ],
  providers: [MessageService],
  templateUrl: './verventa.component.html',
  styleUrl: './verventa.component.scss'
})
export class VerventaComponent implements OnInit {
  venta!: VentaSimpleDto;
  cantidades: Pick<CantidadDto, 'id' | 'cantidad' | 'precioActual' | 'producto'>[] = [];
  totalRecords: number = 0;
  loading: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ventaService: VentaService,
    private securityService: SecurityService,
    private messageService: MessageService) {
  }

  // Verificar si el usuario es administrador
  private isAdmin(): boolean {
    const roles = this.securityService.getUserRoles();
    return roles && roles.includes('ADMIN');
  }

  // Verificar si el usuario actual puede ver esta venta
  private canViewVenta(venta: VentaSimpleDto): boolean {
    // Si es admin, puede ver todas las ventas
    if (this.isAdmin()) {
      return true;
    }
    
    // Si es cajero, solo puede ver sus propias ventas
    const currentUser = this.securityService.getUserName();
    return venta.usuario === currentUser;
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    if (id && !isNaN(id)) {
      this.cargarVenta(id);
    } else {
      this.error = 'ID de venta inválido';
      this.loading = false;
    }
  }

  cargarVenta(id: number) {
    console.log('Cargando venta con ID:', id);
    this.loading = true;
    
    this.ventaService.obtenerVenta(id).subscribe({
      next: (venta) => {
        console.log('Respuesta del backend:', venta);
        
        // Verificar si la venta está activa
        if (!venta.activo) {
          console.warn('Intento de acceso a venta eliminada');
          this.error = 'Esta venta ha sido eliminada y no está disponible para visualización';
          this.loading = false;
          this.mostrarErrorYRedirigir('Esta venta ha sido eliminada y no está disponible.');
          return;
        }

        // Verificar permisos de acceso
        if (!this.canViewVenta(venta)) {
          console.warn('Intento de acceso no autorizado a venta');
          this.error = 'No tienes permisos para ver esta venta';
          this.loading = false;
          this.mostrarErrorYRedirigir('No tienes permisos para ver esta venta.');
          return;
        }
        
        this.venta = venta;
        
        // Usar directamente las cantidades del DTO sin mapeo
        if (venta.cantidades && Array.isArray(venta.cantidades)) {
          this.cantidades = venta.cantidades;
        } else {
          console.warn('No se encontraron cantidades en la respuesta');
          this.cantidades = [];
        }
        
        this.totalRecords = this.cantidades.length;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error completo:', error);
        if (error.status === 404) {
          this.error = 'La venta solicitada no existe o ha sido eliminada';
          this.mostrarErrorYRedirigir('La venta solicitada no existe.');
        } else if (error.status === 403) {
          this.error = 'No tienes permisos para ver esta venta';
          this.mostrarErrorYRedirigir('No tienes permisos para ver esta venta.');
        } else {
          this.error = `Error al cargar los datos de la venta. Status: ${error.status}`;
          this.mostrarErrorYRedirigir('Error al cargar la venta.');
        }
        this.loading = false;
      }
    });
  }

  private mostrarErrorYRedirigir(mensaje: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Acceso Denegado',
      detail: mensaje,
      life: 3000
    });
    
    // Redirigir después de mostrar el mensaje
    setTimeout(() => {
      this.router.navigate(['/ventas']);
    }, 2000);
  }
  
  calcularTotal(): number {
    return this.cantidades.reduce((total, cantidad) =>
      total + (cantidad.cantidad * cantidad.precioActual), 0);
  }

  calcularCantidadTotal(): number {
    return this.cantidades.reduce((sum, c) => sum + c.cantidad, 0);
  }

  // ==================== LÓGICA DE OFERTAS ====================

  /**
   * Verifica si una oferta estaba vigente en la fecha de la venta
   */
  esOfertaVigenteEnFecha(oferta: ComboDto | PromocionDto | DescuentoDto): boolean {
    if (!oferta.activo) return false;
    
    const fechaVenta = new Date(this.venta.fechaVenta);
    const inicioOferta = new Date(oferta.inicio);
    const finOferta = new Date(oferta.fin);
    
    return fechaVenta >= inicioOferta && fechaVenta <= finOferta;
  }

  /**
   * Obtiene los descuentos que estaban vigentes para un producto en la fecha de la venta
   */
  getDescuentosVigentes(producto: any): DescuentoDto[] {
    if (!producto.descuentos) return [];
    
    return producto.descuentos.filter((descuento: DescuentoDto) => 
      this.esOfertaVigenteEnFecha(descuento)
    );
  }

  /**
   * Obtiene las promociones que estaban vigentes para un producto en la fecha de la venta
   */
  getPromocionesVigentes(producto: any): PromocionDto[] {
    if (!producto.promociones) return [];
    
    return producto.promociones.filter((promocion: PromocionDto) => 
      this.esOfertaVigenteEnFecha(promocion)
    );
  }

  /**
   * Obtiene los combos que estaban vigentes para un producto en la fecha de la venta
   */
  getCombosVigentes(producto: any): ComboDto[] {
    if (!producto.combos) return [];
    
    return producto.combos.filter((combo: ComboDto) => 
      this.esOfertaVigenteEnFecha(combo)
    );
  }

  /**
   * Verifica si un producto tenía ofertas aplicadas en la fecha de la venta
   * Se basa únicamente en si las ofertas estaban vigentes y se cumplían los criterios mínimos
   */
  tieneOfertasVigentes(producto: any): boolean {
    const itemEnVenta = this.cantidades.find(cantidad => cantidad.producto.id === producto.id);
    
    if (!itemEnVenta) {
      return false;
    }
    
    // Verificar descuentos vigentes - si había descuentos vigentes, asumimos que se aplicaron
    const descuentos = this.getDescuentosVigentes(producto);
    if (descuentos.length > 0) {
      return true;
    }
    
    // Verificar promociones vigentes - solo si se cumple la cantidad mínima requerida
    const promociones = this.getPromocionesVigentes(producto);
    for (const promocion of promociones) {
      if (itemEnVenta.cantidad >= promocion.descuento) {
        return true;
      }
    }
    
    // Verificar combos vigentes - si había combos vigentes, asumimos que se aplicaron
    const combos = this.getCombosVigentes(producto);
    if (combos.length > 0) {
      return true;
    }
    
    return false;
  }

  /**
   * Obtiene el texto descriptivo de las ofertas aplicadas
   */
  getTextoOfertas(producto: any): string {
    if (!this.tieneOfertasVigentes(producto)) {
      return '';
    }
    
    const itemEnVenta = this.cantidades.find(cantidad => cantidad.producto.id === producto.id);
    if (!itemEnVenta) return '';
    
    const ofertas: string[] = [];
    
    // Mostrar descuentos vigentes
    const descuentos = this.getDescuentosVigentes(producto);
    descuentos.forEach(desc => ofertas.push(`Descuento ${desc.descuento}%`));
    
    // Mostrar promociones vigentes solo si se cumple la cantidad mínima
    const promociones = this.getPromocionesVigentes(producto);
    promociones.forEach(promo => {
      if (itemEnVenta.cantidad >= promo.descuento) {
        ofertas.push(`Promoción ${promo.descripcion}`);
      }
    });
    
    // Mostrar combos vigentes
    const combos = this.getCombosVigentes(producto);
    combos.forEach(combo => ofertas.push(`Combo: ${combo.descripcion} (${combo.descuento}%)`));
    
    return ofertas.join(', ');
  }

  /**
   * Obtiene la severidad del tag basado en el tipo de oferta
   */
  getSeveridadOferta(producto: any): string {
    if (!this.tieneOfertasVigentes(producto)) {
      return 'secondary';
    }
    
    const itemEnVenta = this.cantidades.find(cantidad => cantidad.producto.id === producto.id);
    if (!itemEnVenta) return 'secondary';
    
    const descuentos = this.getDescuentosVigentes(producto);
    const combos = this.getCombosVigentes(producto);
    
    // Verificar promociones que cumplan con la cantidad mínima
    const promociones = this.getPromocionesVigentes(producto);
    const promocionesAplicables = promociones.filter(promo => itemEnVenta.cantidad >= promo.descuento);
    
    if (combos.length > 0) return 'success';                // Verde para combos
    if (promocionesAplicables.length > 0) return 'info';    // Azul para promociones
    if (descuentos.length > 0) return 'warning';            // Amarillo para descuentos
    
    return 'secondary';
  }

  /**
   * Verifica si hay alguna oferta aplicada en toda la venta
   */
  tieneAlgunaOferta(): boolean {
    if (!this.venta.cantidades) return false;
    
    return this.venta.cantidades.some(cantidad => 
      this.tieneOfertasVigentes(cantidad.producto)
    );
  }
  volver() {
    this.router.navigate(['/ventas']);
  }
}