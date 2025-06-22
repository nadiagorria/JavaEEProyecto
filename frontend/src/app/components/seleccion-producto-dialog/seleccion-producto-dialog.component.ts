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
  template: `
    <p-dialog
      header="Productos con Código Duplicado"
      [modal]="true"
      [visible]="display"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      styleClass="custom-product-dialog"
      [style]="{ width: '85vw', maxWidth: '1000px' }"
      (onHide)="onDialogHide()"
    >
      <div class="dialog-content">
        <div class="info-header mb-4">
          <div class="info-card">
            <div class="info-icon">
              <i class="pi pi-barcode"></i>
            </div>
            <div class="info-text">
              <h4 class="info-title">Múltiples productos encontrados</h4>
              <p class="info-description">
                Se encontraron varios productos con el código de barras:
                <span class="codigo-destacado">{{ codigoBarras }}</span>
              </p>
              <p class="info-instruction">Seleccione el producto correcto:</p>
            </div>
          </div>
        </div>

        <p-table
          [value]="productos"
          [rows]="8"
          [scrollable]="true"
          [tableStyle]="{ 'min-width': '60rem' }"
          styleClass="productos-table"
        >
          <ng-template pTemplate="header">
            <tr class="header-row">
              <th class="action-col">Seleccionar</th>
              <th class="name-col">Producto</th>
              <th class="price-col">Precio</th>
              <th class="stock-col">Stock</th>
              <th class="category-col">Categoría</th>
              <th class="provider-col">Proveedor</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-producto>
            <tr
              [class.producto-sin-stock]="producto.stockTotal <= 0"
              [class.producto-disponible]="producto.stockTotal > 0"
            >
              <td class="action-cell">
                <button
                  pButton
                  type="button"
                  icon="pi pi-check"
                  class="select-btn"
                  [class.btn-disabled]="producto.stockTotal <= 0"
                  [disabled]="producto.stockTotal <= 0"
                  (click)="seleccionarProducto(producto)"
                  pTooltip="{{
                    producto.stockTotal <= 0
                      ? 'Sin stock disponible'
                      : 'Seleccionar este producto'
                  }}"
                  tooltipPosition="top"
                ></button>
              </td>
              <td class="product-info">
                <div
                  class="product-name"
                  [class.text-disabled]="producto.stockTotal <= 0"
                >
                  <i class="pi pi-box mr-2 product-icon"></i>
                  {{ producto.nombre }}
                </div>
                <div *ngIf="producto.stockTotal <= 0" class="stock-warning">
                  <i class="pi pi-exclamation-triangle mr-1"></i>
                  Sin stock disponible
                </div>
                <div class="barcode-info">
                  <i class="pi pi-barcode mr-1"></i>
                  {{ producto.codigoDeBarra }}
                </div>
              </td>
              <td
                class="price-cell"
                [class.text-disabled]="producto.stockTotal <= 0"
              >
                <div class="price-display">
                  <span class="currency-symbol">$</span>
                  <span class="price-amount">{{
                    producto.precioVenta | number : '1.0-2'
                  }}</span>
                </div>
              </td>
              <td class="stock-cell">
                <div
                  class="stock-badge"
                  [class.stock-empty]="producto.stockTotal <= 0"
                  [class.stock-low]="
                    producto.stockTotal > 0 &&
                    producto.stockTotal <= producto.stockMin
                  "
                  [class.stock-good]="producto.stockTotal > producto.stockMin"
                >
                  <i
                    class="pi"
                    [class.pi-times]="producto.stockTotal <= 0"
                    [class.pi-exclamation-triangle]="
                      producto.stockTotal > 0 &&
                      producto.stockTotal <= producto.stockMin
                    "
                    [class.pi-check]="producto.stockTotal > producto.stockMin"
                  ></i>
                  <span>{{ producto.stockTotal }} unidades</span>
                </div>
              </td>
              <td
                class="category-cell"
                [class.text-disabled]="producto.stockTotal <= 0"
              >
                <div
                  class="category-info"
                  *ngIf="producto.categoria; else noCategory"
                >
                  <i class="pi pi-tag mr-2 category-icon"></i>
                  <span class="category-name">{{
                    producto.categoria.nombre
                  }}</span>
                </div>
                <ng-template #noCategory>
                  <div class="no-data">
                    <i class="pi pi-minus mr-1"></i>
                    <span>Sin categoría</span>
                  </div>
                </ng-template>
              </td>
              <td
                class="provider-cell"
                [class.text-disabled]="producto.stockTotal <= 0"
              >
                <div
                  class="provider-info"
                  *ngIf="producto.proveedor; else noProvider"
                >
                  <i class="pi pi-building mr-2 provider-icon"></i>
                  <span class="provider-name">{{
                    producto.proveedor.nombre
                  }}</span>
                </div>
                <ng-template #noProvider>
                  <div class="no-data">
                    <i class="pi pi-minus mr-1"></i>
                    <span>Sin proveedor</span>
                  </div>
                </ng-template>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="empty-message">
                <div class="empty-content">
                  <i class="pi pi-info-circle empty-icon"></i>
                  <span>No se encontraron productos</span>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          <button
            pButton
            type="button"
            label="Cancelar"
            icon="pi pi-times"
            class="cancel-btn"
            (click)="cancelar()"
          ></button>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [
    `
      :host ::ng-deep .custom-product-dialog .p-dialog-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px 12px 0 0;
        padding: 1.25rem 1.5rem;
        border-bottom: none;
      }

      :host ::ng-deep .custom-product-dialog .p-dialog-content {
        padding: 1.5rem;
        background: #f8fafc;
      }

      :host ::ng-deep .custom-product-dialog .p-dialog {
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
          0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }

      .info-header {
        margin-bottom: 1.5rem;
      }

      .info-card {
        display: flex;
        align-items: flex-start;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.25rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        border-left: 4px solid #667eea;
      }

      .info-icon {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        width: 50px;
        height: 50px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 1rem;
        flex-shrink: 0;
      }

      .info-icon i {
        font-size: 1.5rem;
      }

      .info-text {
        flex: 1;
      }

      .info-title {
        margin: 0 0 0.5rem 0;
        color: #2d3748;
        font-size: 1.125rem;
        font-weight: 600;
      }

      .info-description {
        margin: 0 0 0.5rem 0;
        color: #4a5568;
        font-size: 0.95rem;
        line-height: 1.5;
      }

      .info-instruction {
        margin: 0;
        color: #718096;
        font-size: 0.875rem;
        font-weight: 500;
      }

      .codigo-destacado {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 6px;
        font-weight: 600;
        font-family: 'Courier New', monospace;
      }

      :host ::ng-deep .productos-table {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }

      :host ::ng-deep .productos-table .p-datatable-thead > tr > th {
        background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
        color: white;
        font-weight: 600;
        padding: 1rem 0.75rem;
        border: none;
        text-align: left;
      }

      :host ::ng-deep .productos-table .p-datatable-tbody > tr {
        transition: all 0.2s ease;
        border-bottom: 1px solid #e2e8f0;
      }

      :host ::ng-deep .productos-table .p-datatable-tbody > tr:hover {
        background-color: #f7fafc !important;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }

      :host ::ng-deep .productos-table .p-datatable-tbody > tr > td {
        padding: 1rem 0.75rem;
        border: none;
        vertical-align: top;
      }

      .action-col {
        width: 100px;
        text-align: center;
      }
      .name-col {
        width: 35%;
      }
      .price-col {
        width: 12%;
      }
      .stock-col {
        width: 15%;
      }
      .category-col {
        width: 18%;
      }
      .provider-col {
        width: 20%;
      }

      .select-btn {
        background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
        border: none;
        border-radius: 8px;
        padding: 0.5rem 0.75rem;
        color: white;
        font-weight: 500;
        transition: all 0.2s ease;
        min-width: 70px;
      }

      .select-btn:hover:not(.btn-disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
      }

      .btn-disabled {
        background: #cbd5e0 !important;
        color: #a0aec0 !important;
        cursor: not-allowed;
        transform: none !important;
        box-shadow: none !important;
      }

      .product-info {
        padding-right: 1rem;
      }

      .product-name {
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 0.25rem;
        display: flex;
        align-items: center;
      }

      .product-icon {
        color: #667eea;
      }

      .stock-warning {
        color: #e53e3e;
        font-size: 0.75rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
        display: flex;
        align-items: center;
      }

      .barcode-info {
        color: #718096;
        font-size: 0.875rem;
        font-family: 'Courier New', monospace;
        display: flex;
        align-items: center;
      }

      .price-display {
        display: flex;
        align-items: baseline;
        font-weight: 600;
        color: #2d3748;
      }

      .currency-symbol {
        font-size: 0.875rem;
        margin-right: 0.125rem;
        color: #4a5568;
      }

      .price-amount {
        font-size: 1.125rem;
      }

      .stock-badge {
        display: inline-flex;
        align-items: center;
        padding: 0.375rem 0.75rem;
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 600;
        gap: 0.375rem;
      }

      .stock-empty {
        background: #fed7d7;
        color: #c53030;
      }

      .stock-low {
        background: #feebc8;
        color: #c05621;
      }

      .stock-good {
        background: #c6f6d5;
        color: #2f855a;
      }

      .category-info {
        display: flex;
        align-items: center;
        color: #4a5568;
      }

      .category-icon {
        color: #ed8936;
      }

      .category-name {
        font-weight: 500;
      }

      .provider-info {
        display: flex;
        align-items: center;
        color: #4a5568;
      }

      .provider-icon {
        color: #3182ce;
      }

      .provider-name {
        font-weight: 500;
      }

      .no-data {
        color: #a0aec0;
        font-style: italic;
        display: flex;
        align-items: center;
      }

      .text-disabled {
        color: #a0aec0 !important;
      }

      .text-disabled .product-icon,
      .text-disabled .category-icon,
      .text-disabled .provider-icon {
        color: #cbd5e0 !important;
      }

      :host ::ng-deep .producto-sin-stock {
        background: #fef5e7 !important;
        opacity: 0.7;
      }

      :host ::ng-deep .producto-disponible:hover {
        background: #f0fff4 !important;
      }

      .empty-message {
        text-align: center;
        padding: 3rem 1rem !important;
      }

      .empty-content {
        color: #718096;
        font-size: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
      }

      .empty-icon {
        font-size: 1.25rem;
        color: #a0aec0;
      }

      .dialog-footer {
        display: flex;
        justify-content: flex-end;
        padding: 1rem 0 0 0;
        border-top: 1px solid #e2e8f0;
        margin-top: 1rem;
      }

      .cancel-btn {
        background: #6c757d;
        border: none;
        border-radius: 8px;
        padding: 0.75rem 1.5rem;
        color: white;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .cancel-btn:hover {
        background: #5a6268;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
      }

      @media (max-width: 768px) {
        .info-card {
          flex-direction: column;
          text-align: center;
        }

        .info-icon {
          margin: 0 auto 1rem auto;
        }

        :host ::ng-deep .custom-product-dialog {
          width: 95vw !important;
          margin: 1rem;
        }

        .action-col,
        .stock-col {
          width: auto;
        }
        .name-col {
          width: 40%;
        }
        .category-col,
        .provider-col {
          width: 30%;
        }
      }
    `,
  ],
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
