import { Component, OnInit } from '@angular/core';
import { VentaDto } from 'src/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { CalendarModule } from 'primeng/calendar';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { VentaService } from '../../../services/venta.service';
import { SecurityService } from '../../../services/security.service';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    CurrencyPipe,
    RouterModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    CalendarModule,
    ToastModule,
    ConfirmDialogModule,
    HeaderComponent,
    FooterComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.scss',
})
export class VentasComponent implements OnInit {
  ventas: VentaDto[] = [];
  selectedVenta: VentaDto | null = null;
  isAdmin: boolean = false;

  paginaActual: number = 0;
  ventasPorPagina: number = 10;
  totalElementos: number = 0;

  fechaDesde: Date | null = null;
  fechaHasta: Date | null = null;

  cargando: boolean = false;

  constructor(
    private ventaService: VentaService,
    private securityService: SecurityService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}
  ngOnInit() {
    if (this.securityService.isLoggedIn() && this.securityService.user) {
      this.isAdmin =
        this.securityService.user.roles?.includes('ADMIN') || false;
    }
  }
  private formatearFecha(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }

  aplicarFiltros() {
    this.paginaActual = 0;

    const event = {
      first: 0,
      rows: this.ventasPorPagina,
    };
    this.cargarVentasLazy(event);
  }

  limpiarFiltros() {
    this.fechaDesde = null;
    this.fechaHasta = null;
    this.aplicarFiltros();
  }

  cargarVentasLazy(event: any) {
    this.cargando = true;

    const pagina = Math.floor(event.first / event.rows);
    const tamanoPagina = event.rows;

    const fechaDesdeStr = this.fechaDesde
      ? this.formatearFecha(this.fechaDesde)
      : undefined;
    const fechaHastaStr = this.fechaHasta
      ? this.formatearFecha(this.fechaHasta)
      : undefined;

    this.ventaService
      .listarVentasPaginadas(pagina, tamanoPagina, fechaDesdeStr, fechaHastaStr)
      .subscribe({
        next: (response) => {
          this.ventas = response.content || [];
          this.totalElementos = response.totalElements || 0;
          this.paginaActual = pagina;
          this.ventasPorPagina = tamanoPagina;
          this.cargando = false;
        },
        error: (error) => {
          this.cargando = false;
          this.messageService.clear();
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar las ventas',
          });
        },
      });
  }

  verVenta(id: number | null) {
    if (id) {
      window.open(`/verventa/${id}`, '_blank');
    }
  }

  eliminarVenta(id: number | null) {
    if (!id) return;

    this.confirmationService.confirm({
      message:
        '¿Está seguro que desea eliminar esta venta? Esta acción devolverá el stock de los productos.',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.ventaService.eliminarVenta(id).subscribe({
          next: (response) => {
            this.messageService.clear();
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Venta eliminada correctamente',
            });

            const event = {
              first: this.paginaActual * this.ventasPorPagina,
              rows: this.ventasPorPagina,
            };
            this.cargarVentasLazy(event);
          },
          error: (error) => {
            this.messageService.clear();
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar la venta',
            });
          },
        });
      },
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
