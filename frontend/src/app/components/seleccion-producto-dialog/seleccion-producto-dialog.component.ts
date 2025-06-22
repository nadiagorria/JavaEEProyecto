import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProductoDto } from '../../../models/producto.dto';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-seleccion-producto-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    TableModule,
    TooltipModule,
  ],
  templateUrl: './seleccion-producto-dialog.component.html',
  styleUrl: './seleccion-producto-dialog.component.scss',
})
export class SeleccionProductoDialogComponent {
  @Input() display: boolean = false;
  @Input() productos: ProductoDto[] = [];
  @Input() codigoBarras: string = '';

  @Output() productoSeleccionado = new EventEmitter<ProductoDto>();
  @Output() dialogCerrado = new EventEmitter<void>();

  seleccionarProducto(producto: ProductoDto) {
    if (producto.stockTotal > 0) {
      this.productoSeleccionado.emit(producto);
      this.display = false;
    }
  }

  cancelar() {
    this.display = false;
    this.dialogCerrado.emit();
  }

  onDialogHide() {
    this.dialogCerrado.emit();
  }
}
