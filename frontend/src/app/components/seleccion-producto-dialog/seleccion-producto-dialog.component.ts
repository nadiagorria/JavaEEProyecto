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
  imports: [CommonModule, ButtonModule, DialogModule, TableModule, TooltipModule],
  template: `
    <p-dialog 
      header="Seleccionar Producto"
      [modal]="true"
      [visible]="display"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      styleClass="p-fluid"
      [style]="{width: '70vw', maxWidth: '800px'}"
      (onHide)="onDialogHide()">
      
      <div class="dialog-content">
        <div class="mb-3">
          <p class="text-lg font-medium text-blue-700">
            <i class="pi pi-info-circle mr-2"></i>
            Se encontraron múltiples productos con el código: <strong>{{codigoBarras}}</strong>
          </p>
          <p class="text-sm text-gray-600">
            Seleccione el producto correcto de la lista:
          </p>
        </div>

        <p-table 
          [value]="productos" 
          [rows]="10"
          [scrollable]="true"
          [tableStyle]="{'min-width': '50rem'}"
          styleClass="p-datatable-striped">
          
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 3rem">Acción</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Categoría</th>
              <th>Proveedor</th>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="body" let-producto>
            <tr [class.bg-red-50]="producto.stockTotal <= 0">
              <td>
                <button 
                  pButton 
                  type="button" 
                  icon="pi pi-check" 
                  class="p-button-sm p-button-success"
                  [disabled]="producto.stockTotal <= 0"
                  (click)="seleccionarProducto(producto)"
                  pTooltip="{{producto.stockTotal <= 0 ? 'Sin stock disponible' : 'Seleccionar este producto'}}"
                  tooltipPosition="top">
                </button>
              </td>
              <td>
                <div [class.text-gray-400]="producto.stockTotal <= 0">
                  {{producto.nombre}}
                  <div *ngIf="producto.stockTotal <= 0" class="text-xs text-red-500 font-semibold">
                    *Sin stock
                  </div>
                </div>
              </td>
              <td [class.text-gray-400]="producto.stockTotal <= 0">
                {{producto.precioVenta | currency}}
              </td>
              <td>
                <span 
                  [class]="producto.stockTotal <= 0 ? 'text-red-500 font-bold' : 
                          producto.stockTotal <= producto.stockMin ? 'text-orange-500 font-semibold' : 'text-green-600'">
                  {{producto.stockTotal}}
                </span>
              </td>
              <td [class.text-gray-400]="producto.stockTotal <= 0">
                {{producto.categoria?.nombre || 'Sin categoría'}}
              </td>
              <td [class.text-gray-400]="producto.stockTotal <= 0">
                {{producto.proveedor?.nombre || 'Sin proveedor'}}
              </td>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center p-4">
                <i class="pi pi-info-circle mr-2"></i>
                No se encontraron productos
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <ng-template pTemplate="footer">
        <div class="flex justify-content-end gap-2">
          <button 
            pButton 
            type="button" 
            label="Cancelar" 
            icon="pi pi-times"
            class="p-button-secondary"
            (click)="cancelar()">
          </button>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .dialog-content {
      min-height: 200px;
    }
    
    :host ::ng-deep .p-datatable .p-datatable-tbody > tr.bg-red-50 {
      background: #fef2f2 !important;
    }
    
    :host ::ng-deep .p-datatable .p-datatable-tbody > tr.bg-red-50:hover {
      background: #fee2e2 !important;
    }
    
    :host ::ng-deep .p-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
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
