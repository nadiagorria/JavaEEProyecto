import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EntidadService } from 'src/services/entidad.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProveedorDto } from 'src/models/proveedor.dto';
import { SecurityService } from 'src/services/security.service';

@Component({
  selector: 'app-proveedores',
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    FooterComponent,
    InputGroupModule,
    InputGroupAddonModule,
    ButtonModule,
    MenuModule,
    TableModule,
    DialogModule,
    TooltipModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.scss',
})
export class ProveedoresComponent {
  busqueda: string = '';
  proveedores: ProveedorDto[] = [];
  proveedoresFiltrados: ProveedorDto[] = [];
  totalRecords: number = 0;
  constructor(
    private router: Router,
    private entidadService: EntidadService,
    private securityService: SecurityService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    if (!this.securityService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.cargarProveedores();
  }

  cargarProveedores(): void {
    this.entidadService.listadoProveedores().subscribe({
      next: (data: any) => {
        if (data && Array.isArray(data)) {
          this.proveedores = data;
        } else if (
          data &&
          data.proveedores &&
          Array.isArray(data.proveedores)
        ) {
          this.proveedores = data.proveedores;
        } else {
          this.proveedores = [];
        }

        this.proveedores.sort((a, b) => a.nombre.localeCompare(b.nombre));

        this.proveedoresFiltrados = [...this.proveedores];
        this.totalRecords = this.proveedores.length;
      },
      error: (err: any) => {
        if (err.status === 403) {
          alert(
            'Sesión expirada o sin autorización. Por favor, inicie sesión nuevamente.'
          );
          this.securityService.logout();
          return;
        }

        alert('Error al listar proveedores: ' + (err.message || err.status));
        this.proveedores = [];
        this.proveedoresFiltrados = [];
        this.totalRecords = 0;
      },
    });
  }

  visible: boolean = false;

  mostarModal() {
    this.visible = true;
  }

  cerrarDialog() {
    this.visible = false;

    this.nombre = '';
    this.telefono = '';
    this.correo = '';
  }

  nombre: string = '';
  telefono: string = '';
  correo: string = '';

  private validarEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
  saveProveedor() {
    if (!this.nombre || this.nombre.trim() === '') {
      this.messageService.clear();
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'El nombre del proveedor es obligatorio',
      });
      return;
    }
    if (/\d/.test(this.nombre)) {
      this.messageService.clear();
      this.messageService.add({
        severity: 'warn',
        summary: 'Formato inválido',
        detail: 'El nombre del proveedor no puede contener números',
      });
      return;
    }

    if (!this.telefono || this.telefono.trim() === '') {
      this.messageService.clear();
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'El teléfono del proveedor es obligatorio',
      });
      return;
    }
    if (!/^[0-9+\s-]+$/.test(this.telefono)) {
      this.messageService.clear();
      this.messageService.add({
        severity: 'warn',
        summary: 'Formato inválido',
        detail:
          'El teléfono solo puede contener números, espacios, guiones y el símbolo +',
      });
      return;
    }

    if (!this.correo || this.correo.trim() === '') {
      this.messageService.clear();
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'El correo del proveedor es obligatorio',
      });
      return;
    }
    if (!this.validarEmail(this.correo)) {
      this.messageService.clear();
      this.messageService.add({
        severity: 'warn',
        summary: 'Email inválido',
        detail: 'Por favor ingrese un email válido (ejemplo@correo.com)',
      });
      return;
    }

    const proveedor: ProveedorDto = {
      id: null,
      nombre: this.nombre.trim(),
      telefono: this.telefono.trim(),
      correo: this.correo.trim(),
      productosDto: [],
      activo: true,
    };

    this.entidadService.crearProveedor(proveedor).subscribe({
      next: (data: any) => {
        this.visible = false;
        this.nombre = '';
        this.telefono = '';
        this.correo = '';

        this.messageService.clear();
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Proveedor creado exitosamente',
        });

        this.cargarProveedores();
      },
      error: (err: any) => {
        let mensajeError = 'Error al crear proveedor';
        if (err.error && typeof err.error === 'string') {
          mensajeError = err.error;
        } else if (err.message) {
          mensajeError = err.message;
        }

        this.messageService.clear();
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: mensajeError,
        });
      },
    });
  }

  buscarProveedor() {
    if (this.busqueda.trim() === '') {
      this.proveedoresFiltrados = [...this.proveedores];
    } else {
      this.proveedoresFiltrados = this.proveedores.filter((proveedor) =>
        proveedor.nombre.toLowerCase().includes(this.busqueda.toLowerCase())
      );
    }

    this.proveedoresFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));

    this.totalRecords = this.proveedoresFiltrados.length;
  }

  mostrarDetalles(id: number) {
    this.router.navigate(['/proveedor', id]);
  }
  eliminarProveedor(id: number) {
    const proveedor = this.proveedores.find((p) => p.id === id);

    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar el proveedor "${proveedor?.nombre}"? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonStyleClass: 'p-button-text',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.entidadService.eliminarPersona(id).subscribe({
          next: (data: any) => {
            this.proveedores = this.proveedores.filter((p) => p.id !== id);
            this.proveedoresFiltrados = this.proveedoresFiltrados.filter(
              (p) => p.id !== id
            );
            this.totalRecords = this.proveedoresFiltrados.length;

            this.messageService.clear();
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Proveedor eliminado correctamente',
            });
          },
          error: (err: any) => {
            let mensajeError = 'Error al eliminar proveedor';
            if (err.error && typeof err.error === 'string') {
              mensajeError = err.error;
            } else if (err.message) {
              mensajeError = err.message;
            }

            this.messageService.clear();
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: mensajeError,
            });
          },
        });
      },
    });
  }

  isAdmin(): boolean {
    const roles = this.securityService.getUserRoles();

    if (!roles) {
      return false;
    }

    const hasAdminRole = roles.includes('ADMIN');

    return hasAdminRole;
  }

  onBusquedaChange(event: any) {
    this.busqueda = event.target.value;
  }

  onBusquedaKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.buscarProveedor();
    }
  }
}
