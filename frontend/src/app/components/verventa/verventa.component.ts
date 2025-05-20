import { Component, OnInit } from '@angular/core';
import { VentaDto, CantidadDto } from 'src/models';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';

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
  venta!: VentaDto;
  cantidades: CantidadDto[] = [];
  totalRecords: number = 0;

  constructor() {
    // Mock data
    this.venta = {
      id: 1,
      fechaVenta: new Date(),
      total: 93,
      formaPago: 'EFECTIVO',
      usuario: {
        nombre: 'Juan Pérez',
        mail: 'juan@mail.com'
      },
      cantidades: [
        {
          id: 1,
          cantidad: 2,
          precioActual: 23,
        
        producto: {
            id: 1,
            nombre: 'Laptop',
            precioVenta: 23,
            codigoDeBarra: '987654321'
          },
        },
        {
          id: 2,
          cantidad: 7,
          precioActual: 8,
        
        producto: {
            id: 3,
            nombre: 'Juan',
            precioVenta: 80,
            codigoDeBarra: '123456789'
          },
        }
      ],
      credito: {
        id: 0,
        precioTotal: 0
      },
      activo: true,
      finalizada: true
    };

    this.cantidades = this.venta.cantidades.map(c => ({
      id: c.id,
      cantidad: c.cantidad,
      precioActual: c.precioActual,
      producto: c.producto,
      venta: {
        id: this.venta.id,
        fechaVenta: this.venta.fechaVenta
      }
    }));
    this.totalRecords = this.cantidades.length;
  }


  ngOnInit() {
    // Aquí cargarías la venta seleccionada
    // this.ventaService.getVenta(id).subscribe(venta => {
    //   this.venta = venta;
    //   this.cantidades = venta.cantidades;
    //   this.totalRecords = this.cantidades.length;
    // });
  }

  calcularTotal(): number {
    return this.cantidades.reduce((total, cantidad) =>
      total + (cantidad.cantidad * cantidad.producto.precioVenta), 0);
  }

  calcularCantidadTotal(): number {
    return this.cantidades.reduce((sum, c) => sum + c.cantidad, 0);
  }
}
