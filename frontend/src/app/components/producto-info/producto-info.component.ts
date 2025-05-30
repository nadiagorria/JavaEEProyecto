import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';   // necesario para pipes
import { TableModule } from 'primeng/table';      // necesario para p-table
import { ButtonModule } from 'primeng/button';    // necesario para botones pButton
import { ProductoService } from 'src/services/producto.service';

import { ProductoDto } from 'src/models/producto.dto';
import { LoteDto } from 'src/models/lote.dto';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-producto-info',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  templateUrl: './producto-info.component.html',
  styleUrls: ['./producto-info.component.scss']
})
export class ProductoInfoComponent {

  constructor(
        private productoService: ProductoService,
        private route: ActivatedRoute,
        private router: Router
      ) { }

  producto?: ProductoDto;
  error: string = '';
  loading: boolean = true;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    if (id && !isNaN(id)) {
      this.cargarProducto(id);
    } else {
      this.error = 'ID de producto inválido';
      this.loading = false;
    }
  }

  cargarProducto(id: number) {
    this.productoService.obtenerProducto(id).subscribe({
      next: (response) => {
        console.log('Respuesta del backend:', response);
        this.producto = response;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
      }
    });
  }

  /*producto = {
    nombre: 'Nombre Producto',
    codigoInterno: '12345',
    codigoBarras: 'ABC123',
    proveedor: 'Proveedor X',
    cantidadVentas: 15,
    stockTotal: 20,
    precio: 123,
    lotes: [
      {
        id: 1,
        numero: 34567,
        fechaVencimiento: new Date('2000-12-10'),
        precioCompra: 123,
        stock: 3
      },
      {
        id: 2,
        numero: 2345,
        fechaVencimiento: new Date('2025-10-30'),
        precioCompra: 45,
        stock: 0
      }
    ]
  };

  eliminarLote(loteId: number) {
    this.producto.lotes = this.producto.lotes.filter(l => l.id !== loteId);
  }

  agregarLote() {
    // Agrega un lote dummy para ejemplo
    const nuevoId = this.producto.lotes.length ? Math.max(...this.producto.lotes.map(l => l.id)) + 1 : 1;
    const nuevoLote = {
      id: nuevoId,
      numero: Math.floor(Math.random() * 100000),
      fechaVencimiento: new Date(),
      precioCompra: 50,
      stock: 10
    };
    this.producto.lotes = [...this.producto.lotes, nuevoLote];
  }*/
}
