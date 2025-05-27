import { Component, OnInit } from '@angular/core';
import { VentaSimpleDto, CantidadDto, ComboDto, PromocionDto, DescuentoDto } from 'src/models';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { VentaService } from 'src/services/venta.service';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-verventa',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    CurrencyPipe,
    TagModule,
    TooltipModule
  ],
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
    private ventaService: VentaService) {
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
        this.error = `Error al cargar los datos de la venta. Status: ${error.status}`;
        this.loading = false;
      }
    });
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
   */
  tieneOfertasVigentes(producto: any): boolean {
    const descuentos = this.getDescuentosVigentes(producto);
    const promociones = this.getPromocionesVigentes(producto);
    const combos = this.getCombosVigentes(producto);
    
    return descuentos.length > 0 || promociones.length > 0 || combos.length > 0;
  }

  /**
   * Obtiene el texto descriptivo de las ofertas aplicadas
   */
  getTextoOfertas(producto: any): string {
    const ofertas: string[] = [];
    
    const descuentos = this.getDescuentosVigentes(producto);
    const promociones = this.getPromocionesVigentes(producto);
    const combos = this.getCombosVigentes(producto);
    
    descuentos.forEach(desc => ofertas.push(`Descuento ${desc.descuento}%`));
    promociones.forEach(promo => ofertas.push(`Promoción ${promo.descripcion}`));
    combos.forEach(combo => ofertas.push(`Combo: ${combo.descripcion} (${combo.descuento}%)`));
    
    return ofertas.join(', ');
  }
  /**
   * Obtiene la severidad del tag basado en el tipo de oferta
   */
  getSeveridadOferta(producto: any): string {
    const descuentos = this.getDescuentosVigentes(producto);
    const promociones = this.getPromocionesVigentes(producto);
    const combos = this.getCombosVigentes(producto);
    
    if (combos.length > 0) return 'success';      // Verde para combos
    if (promociones.length > 0) return 'info';    // Azul para promociones
    if (descuentos.length > 0) return 'warning';  // Amarillo para descuentos
    
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