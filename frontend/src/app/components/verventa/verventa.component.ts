import { Component, OnInit } from '@angular/core';
import { VentaSimpleDto, CantidadDto } from 'src/models';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { VentaService } from 'src/services/venta.service';

@Component({
  selector: 'app-verventa',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    CurrencyPipe
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

  volver() {
    this.router.navigate(['/ventas']);
  }
}