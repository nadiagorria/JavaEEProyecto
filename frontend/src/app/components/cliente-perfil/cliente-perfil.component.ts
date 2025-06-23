import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TableModule } from 'primeng/table';
import { ClienteDto } from 'src/models/cliente.dto';
import { EntidadService } from 'src/services/entidad.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { CreditoService } from 'src/services/credito.service';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SecurityService } from 'src/services/security.service';
import { VentaService } from 'src/services/venta.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-cliente-perfil',
  imports: [
    FormsModule,
    HeaderComponent,
    FooterComponent,
    ButtonModule,
    InputGroupModule,
    InputGroupAddonModule,
    TableModule,
    DialogModule,
    CommonModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './cliente-perfil.component.html',
  styleUrl: './cliente-perfil.component.scss',
})
export class ClientePerfilComponent {
  cliente!: ClienteDto;

  totalRecords: number = 0;
  constructor(
    private route: ActivatedRoute,
    private entidadService: EntidadService,
    private creditoService: CreditoService,
    private messageService: MessageService,
    private router: Router,
    private securityService: SecurityService,
    private ventaService: VentaService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.entidadService.getCliente(id).subscribe((data) => {
      this.cliente = data;
    });
  }

  visible: boolean = false;
  visibleEditar: boolean = false;

  showDialog() {
    this.visible = true;
  }

  showDialogEditar() {
    this.nombreEdicion = this.cliente.nombre;
    this.telefonoEdicion = this.cliente.telefono;
    this.visibleEditar = true;
  }

  cerrarDialogEditar() {
    this.visibleEditar = false;
    this.nombreEdicion = '';
    this.telefonoEdicion = '';
  }

  pago: number = 0;
  pagoButton() {
    if (this.pago <= 0) {
      this.messageService.clear();this.messageService.add({
        severity: 'warn',
        summary: 'Monto inválido',
        detail: 'El monto a pagar debe ser mayor a cero.',
      });
      return;
    }

    if (this.pago > this.cliente.credito.precioTotal) {
      this.messageService.clear();this.messageService.add({
        severity: 'warn',
        summary: 'Monto excesivo',
        detail: 'El monto a pagar no puede ser mayor a la deuda actual.',
      });
      return;
    }
    this.creditoService
      .pagarCredito(this.cliente.credito.id, this.pago)
      .subscribe(
        (response) => {
          this.entidadService.getCliente(this.cliente.id).subscribe((data) => {
            this.cliente = data;
            this.messageService.clear();
this.messageService.add({
              severity: 'success',
              summary: 'Pago exitoso',
              detail: `Pago de $${this.pago} realizado correctamente.`,
            });
          });
        },
        (error) => {
          this.messageService.clear();
this.messageService.add({
            severity: 'error',
            summary: 'Error en el pago',
            detail: 'Ocurrió un error al procesar el pago. Intente nuevamente.',
          });
        }
      );
    this.visible = false;
    this.pago = 0;
  }

  nombreEdicion: string = '';
  telefonoEdicion: string = '';  editarCliente() {
    if (!this.nombreEdicion || this.nombreEdicion.trim() === '') {
      this.messageService.clear();
this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'El nombre del cliente es obligatorio',
      });
      return;
    }
    if (/\d/.test(this.nombreEdicion)) {
      this.messageService.clear();
this.messageService.add({
        severity: 'warn',
        summary: 'Formato inválido',
        detail: 'El nombre del cliente no puede contener números',
      });
      return;
    }

    if (!this.telefonoEdicion || this.telefonoEdicion.trim() === '') {
      this.messageService.clear();
this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'El teléfono del cliente es obligatorio',
      });
      return;
    }
    if (!/^[0-9+\s-]+$/.test(this.telefonoEdicion)) {
      this.messageService.clear();
this.messageService.add({
        severity: 'warn',
        summary: 'Formato inválido',
        detail: 'El teléfono solo puede contener números, espacios, guiones y el símbolo +',
      });
      return;
    }

    this.cliente.nombre = this.nombreEdicion.trim();
    this.cliente.telefono = this.telefonoEdicion.trim();

    this.entidadService.editarCliente(this.cliente).subscribe({
      next: (data: any) => {
        this.messageService.clear();
this.messageService.add({
          severity: 'success',
          summary: 'Cliente actualizado',
          detail: 'Los datos del cliente se han actualizado correctamente.',
        });
        this.visibleEditar = false;
      },
      error: (err: any) => {
        this.messageService.clear();
this.messageService.add({
          severity: 'error',
          summary: 'Error al editar',
          detail: 'Ocurrió un error al actualizar los datos del cliente.',
        });
      },
    });
  }

  isAdmin(): boolean {
    const roles = this.securityService.getUserRoles();
    if (!roles) {
      return false;
    }
    return roles.includes('ADMIN');
  }

  verVenta(ventaId: number) {
    if (ventaId) {
      this.router.navigate(['/verventa', ventaId]);
    }
  }

  eliminarVenta(ventaId: number) {
    if (!this.isAdmin()) {
      this.messageService.clear();
this.messageService.add({
        severity: 'warn',
        summary: 'Sin permisos',
        detail: 'No tienes permisos para eliminar ventas.',
      });
      return;
    }

    this.confirmationService.confirm({
      message:
        '¿Está seguro de que desea eliminar esta venta? Esta acción no se puede deshacer.',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.ventaService.eliminarVenta(ventaId).subscribe({
          next: (response) => {
            this.messageService.clear();
this.messageService.add({
              severity: 'success',
              summary: 'Venta eliminada',
              detail: 'La venta ha sido eliminada correctamente.',
            });

            this.entidadService
              .getCliente(this.cliente.id)
              .subscribe((data) => {
                this.cliente = data;
              });
          },
          error: (error) => {
            this.messageService.clear();
this.messageService.add({
              severity: 'error',
              summary: 'Error al eliminar',
              detail:
                'Ocurrió un error al eliminar la venta. Intente nuevamente.',
            });
          },
        });
      },
    });
  }
}
