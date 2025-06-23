import { Component, OnInit } from '@angular/core';
import { VentaDto } from 'src/models';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
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
    TableModule,
    CurrencyPipe,
    RouterModule,
    ButtonModule,
    TagModule,
    TooltipModule,
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
    this.ventaService.listarVentas().subscribe({
      next: (response) => {
        this.ventas = response.ventas;

        this.ventas.sort((a, b) => {
          const fechaA = new Date(a.fechaVenta);
          const fechaB = new Date(b.fechaVenta);
          return fechaB.getTime() - fechaA.getTime();
        });
        this.totalRecords = this.ventas.length;
      },
      error: (error) => {
        console.error('Error al cargar ventas:', error);
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
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Venta eliminada correctamente',
            });
            this.cargarVentas();          },
          error: (error) => {
            console.error('Error al eliminar venta:', error);
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
