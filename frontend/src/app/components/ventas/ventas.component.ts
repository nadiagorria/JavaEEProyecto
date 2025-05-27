import { Component, OnInit } from '@angular/core';
import { VentaDto } from 'src/models';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { VentaService } from '../../../services/venta.service';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';


@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    CurrencyPipe,
    RouterModule,
    ButtonModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.scss'
})
export class VentasComponent implements OnInit {
  ventas: VentaDto[] = [];
  totalRecords: number = 0;
  selectedVenta: VentaDto | null = null;

  constructor(private ventaService: VentaService) {
    
    this.totalRecords = this.ventas.length;
  }

  ngOnInit() {
    this.cargarVentas();
  }

  cargarVentas() {
    this.ventaService.listarVentas().subscribe({
      next: (response) => {
        this.ventas = response.ventas;
        // Ordenar por fecha descendente (más nueva primero)
        this.ventas.sort((a, b) => {
          const fechaA = new Date(a.fechaVenta);
          const fechaB = new Date(b.fechaVenta);
          return fechaB.getTime() - fechaA.getTime();
        });
        this.totalRecords = this.ventas.length;
      },
      error: (error) => {
        console.error('Error al cargar ventas:', error);
      }
    });
  }

  abrirVentaEnNuevaPestania(id: number) {
    window.open(`/verventa/${id}`, '_blank');
  }

  onRowSelect(event: any) {
    const venta = event.data;
    if (venta && venta.id) {
      window.open(`/verventa/${venta.id}`, '_blank');
    }
  }
}
