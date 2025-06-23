import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TableModule } from 'primeng/table';
import { EntidadService } from 'src/services/entidad.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProveedorDto } from 'src/models';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { SecurityService } from 'src/services/security.service';
import { ProductoService } from 'src/services/producto.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

interface ComprasCliente {
  id: number;
  codigoBarras: string;
  nombre: string;
  stock: number;
}

@Component({
  selector: 'app-proveedor-perfil',
  imports: [
    FormsModule,
    DialogModule,
    CommonModule,
    HeaderComponent,
    FooterComponent,
    ButtonModule,
    InputGroupModule,
    InputGroupAddonModule,
    TableModule,
    TooltipModule,
    ToastModule,
    InputTextModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './proveedor-perfil.component.html',
  styleUrl: './proveedor-perfil.component.scss',
})
export class ProveedorPerfilComponent {
  proveedor: ProveedorDto = {
    id: 0,
    nombre: '',
    telefono: '',
    correo: '',
    productosDto: [],
    activo: true,
  };

  totalRecords: number = 0;

  visibleEditar: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private entidadService: EntidadService,
    private router: Router,
    private messageService: MessageService,
    private securityService: SecurityService,
    private productoService: ProductoService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.entidadService.getProveedor(id).subscribe((data) => {
      this.proveedor = data;
    });
  }
  showDialogEditar() {
    this.nombreEdicion = this.proveedor.nombre;
    this.telefonoEdicion = this.proveedor.telefono;
    this.correoEdicion = this.proveedor.correo;
    this.visibleEditar = true;
  }

  cerrarDialogEditar() {
    this.visibleEditar = false;

    this.nombreEdicion = '';
    this.telefonoEdicion = '';
    this.correoEdicion = '';
  }

  nombreEdicion: string = '';
  telefonoEdicion: string = '';
  correoEdicion: string = '';

  editarProveedor() {    if (!this.nombreEdicion || this.nombreEdicion.trim() === '') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'El nombre del proveedor es obligatorio',
      });
      return;
    }

    // Validar que el nombre no contenga números
    if (/\d/.test(this.nombreEdicion)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formato inválido',
        detail: 'El nombre del proveedor no puede contener números',
      });
      return;
    }

    if (!this.telefonoEdicion || this.telefonoEdicion.trim() === '') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'El teléfono del proveedor es obligatorio',
      });
      return;
    }

    // Validar que el teléfono solo contenga números, espacios, guiones y el símbolo +
    if (!/^[0-9+\s-]+$/.test(this.telefonoEdicion)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formato inválido',
        detail: 'El teléfono solo puede contener números, espacios, guiones y el símbolo +',
      });
      return;
    }

    if (!this.correoEdicion || this.correoEdicion.trim() === '') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'El correo del proveedor es obligatorio',
      });
      return;
    }

    // Validar formato de correo
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.correoEdicion.trim())) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Email inválido',
        detail: 'Por favor, ingrese un correo electrónico válido.',
      });
      return;
    }

    // Actualizar los datos del proveedor
    this.proveedor.nombre = this.nombreEdicion.trim();
    this.proveedor.telefono = this.telefonoEdicion.trim();
    this.proveedor.correo = this.correoEdicion.trim();

    this.entidadService.editarProveedor(this.proveedor).subscribe({
      next: (data: any) => {
        console.log('Proveedor editado:', data);
        this.messageService.add({
          severity: 'success',
          summary: 'Proveedor actualizado',
          detail: 'Los datos del proveedor se han actualizado correctamente.',
        });
        this.visibleEditar = false;
      },
      error: (err: any) => {
        console.error('Error al editar proveedor:', err);
        let mensajeError = 'Ocurrió un error al actualizar los datos del proveedor.';
        if (err.error && typeof err.error === 'string') {
          mensajeError = err.error;
        } else if (err.message) {
          mensajeError = err.message;
        }
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error al editar',
          detail: mensajeError,
        });
      },
    });
  }

  verProducto(productoId: number) {
    if (productoId) {
      this.router.navigate(['/producto', productoId]);
    }
  }

  isAdmin(): boolean {
    const roles = this.securityService.getUserRoles();
    if (!roles) {
      return false;
    }
    return roles.includes('ADMIN');
  }

  eliminarProducto(productoId: number) {
    if (!this.isAdmin()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin permisos',
        detail: 'No tienes permisos para eliminar productos.',
      });
      return;
    }

    this.confirmationService.confirm({
      message:
        '¿Está seguro de que desea eliminar este producto? Esta acción no se puede deshacer.',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.productoService.eliminarProducto(productoId).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Producto eliminado',
              detail: 'El producto ha sido eliminado correctamente.',
            });
            if (this.proveedor.id) {
              this.entidadService
                .getProveedor(this.proveedor.id)
                .subscribe((data) => {
                  this.proveedor = data;
                });
            }
          },
          error: (error) => {
            console.error('Error al eliminar producto:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error al eliminar',
              detail:
                'Ocurrió un error al eliminar el producto. Intente nuevamente.',
            });
          },
        });
      },
    });
  }
}
