import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';   // necesario para pipes
import { TableModule } from 'primeng/table';      // necesario para p-table
import { ButtonModule } from 'primeng/button';    // necesario para botones pButton
import { DialogModule } from 'primeng/dialog';
import { ProductoService } from 'src/services/producto.service';
import { LoteService } from 'src/services/lote.service';
import { ProductoDto } from 'src/models/producto.dto';
import { LoteDto } from 'src/models/lote.dto';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-producto-info',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, DialogModule, FormsModule],
  templateUrl: './producto-info.component.html',
  styleUrls: ['./producto-info.component.scss']
})
export class ProductoInfoComponent {

  constructor(
        private productoService: ProductoService,
        private route: ActivatedRoute,
        private router: Router,
        private loteService: LoteService
      ) { }

  producto?: ProductoDto;
  error: string = '';
  loading: boolean = true;

  mostrarModalAgregarLote: boolean = false;

  nuevoLote: Partial<LoteDto> = {
    numeLote: '',
    stock: 0,
    fechaVencimiento: undefined,
    precioCompra: 0
  };

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
        console.log('Lotes recibidos:', this.producto.lotes);
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
      }
    });
  }

  /*get lotesActivos() {
    return this.producto?.lotes?.filter(l => l.activo) || [];
  }*/

  eliminarLote(loteId: number) {
    if (!this.producto) return;
    this.loteService.eliminarLote(loteId).subscribe({
      next: () => {
        // Quita el lote inactivo del array local
        this.producto!.lotes = this.producto!.lotes.filter(l => l.id !== loteId);
        this.cargarProducto(this.producto!.id);
      },
      error: (err) => {
        alert('Error al eliminar el lote');
        console.error(err);
      }
    });
  }

  agregarLote() {
    if (!this.producto) return;
    const lote: LoteDto = {
      ...this.nuevoLote,
      id: 0, // El backend asigna el id
      activo: true,
      producto: { id: this.producto.id, nombre: this.producto.nombre }
    } as LoteDto;

    this.loteService.crearLote(lote).subscribe({
      next: () => {
        this.cargarProducto(this.producto!.id);
        this.mostrarModalAgregarLote = false;
        this.nuevoLote = { numeLote: '', stock: 0, fechaVencimiento: undefined, precioCompra: 0 };
      },
      error: (err) => {
        alert('Error al agregar el lote');
        console.error(err);
      }
    });
  }
}
