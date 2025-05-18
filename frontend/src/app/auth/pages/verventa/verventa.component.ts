import { Component } from '@angular/core';
import { VentaDto, CantidadDto } from '@shared/dtos';

@Component({
  selector: 'app-verventa',
  imports: [],
  templateUrl: './verventa.component.html',
  styleUrl: './verventa.component.scss'
})
export class VerventaComponent {


  calcularTotal(): number {
    return this.listaProductos.reduce((total, producto) => {
      return total + (producto.precio * producto.cantidad);
    }, 0);
  }

}
