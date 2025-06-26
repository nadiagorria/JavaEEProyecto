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
  totalRecords: number = 0;
  selectedVenta: VentaDto | null = null;
  isAdmin: boolean = false;

  // Propiedades para paginación
  paginaActual: number = 0;
  ventasPorPagina: number = 10;
  totalElementos: number = 0;
  totalPaginas: number = 0;
  mostrarPaginacion: boolean = false;

  // Propiedades para filtros de fecha
  fechaDesde: Date | null = null;
  fechaHasta: Date | null = null;

  constructor(
    private ventaService: VentaService,
    private securityService: SecurityService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.totalRecords = this.ventas.length;
  }
  ngOnInit() {
    if (this.securityService.isLoggedIn() && this.securityService.user) {
      this.isAdmin =
        this.securityService.user.roles?.includes('ADMIN') || false;
    }
    this.cargarVentas();
  }
  cargarVentas() {
    const fechaDesdeStr = this.fechaDesde ? this.formatearFecha(this.fechaDesde) : undefined;
    const fechaHastaStr = this.fechaHasta ? this.formatearFecha(this.fechaHasta) : undefined;

    this.ventaService.listarVentasPaginadas(this.paginaActual, this.ventasPorPagina, fechaDesdeStr, fechaHastaStr).subscribe({
      next: (response) => {
        this.ventas = response.content || [];
        this.totalElementos = response.totalElements || 0;
        this.totalPaginas = response.totalPages || 0;
        this.mostrarPaginacion = this.totalPaginas > 1;
        this.totalRecords = this.totalElementos;
      },
      error: (error) => {
        this.messageService.clear();
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar las ventas',
        });
      },
    });
  }

  private formatearFecha(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }

  aplicarFiltros() {
    this.paginaActual = 0;
    this.cargarVentas();
  }

  limpiarFiltros() {
    this.fechaDesde = null;
    this.fechaHasta = null;
    this.aplicarFiltros();
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
            this.cargarVentas();
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

  // Métodos de paginación
  irAPagina(pagina: number) {
    if (pagina >= 0 && pagina < this.totalPaginas) {
      this.paginaActual = pagina;
      this.cargarVentas();
    }
  }

  paginaAnterior() {
    if (this.paginaActual > 0) {
      this.paginaActual--;
      this.cargarVentas();
    }
  }

  paginaSiguiente() {
    if (this.paginaActual < this.totalPaginas - 1) {
      this.paginaActual++;
      this.cargarVentas();
    }
  }

  get numeroPaginasArray(): number[] {
    const paginas: number[] = [];
    const maxPaginasVisibles = 5;
    const mitad = Math.floor(maxPaginasVisibles / 2);
    
    let inicio = Math.max(0, this.paginaActual - mitad);
    let fin = Math.min(this.totalPaginas - 1, inicio + maxPaginasVisibles - 1);
    
    if (fin - inicio < maxPaginasVisibles - 1) {
      inicio = Math.max(0, fin - maxPaginasVisibles + 1);
    }
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    
    return paginas;
  }

  get mostrandoDesde(): number {
    return this.paginaActual * this.ventasPorPagina + 1;
  }

  get mostrandoHasta(): number {
    return Math.min((this.paginaActual + 1) * this.ventasPorPagina, this.totalElementos);
  }
}
