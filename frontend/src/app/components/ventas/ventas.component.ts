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
    ButtonModule
  ],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.scss'
})
export class VentasComponent implements OnInit {
  ventas: VentaDto[] = [];
  totalRecords: number = 0;
  selectedVenta: VentaDto | null = null;

  constructor(private ventaService: VentaService) {
    // Mock de ventas
    /*this.ventas = [
      {
        id: 1,
        fechaVenta: new Date('2024-06-01T10:00:00'),
        total: 100,
        formaPago: 'EFECTIVO',
        usuario: { nombre: 'Juan Pérez', mail: 'juan@mail.com' },
        cantidades: [],
        credito: { id: 1, precioTotal: 0 },
        activo: true,
        finalizada: true
      },
      {
        id: 2,
        fechaVenta: new Date('2024-06-02T15:30:00'),
        total: 250,
        formaPago: 'TARJETA',
        usuario: { nombre: 'Ana Gómez', mail: 'ana@mail.com' },
        cantidades: [],
        credito: { id: 2, precioTotal: 0 },
        activo: true,
        finalizada: true
      }
    ];*/
    this.totalRecords = this.ventas.length;
  }

  ngOnInit() {
    this.cargarVentas();
  }

  cargarVentas() {
    this.ventaService.listarVentas().subscribe({
      next: (response) => {
        this.ventas = response.ventas;
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
