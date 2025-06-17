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
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';

interface ComprasCliente {
  id: number;
  codigoBarras: string;
  nombre: string;
  stock: number;
}

@Component({
  selector: 'app-proveedor-perfil',
  imports: [FormsModule, DialogModule, CommonModule, HeaderComponent, FooterComponent, ButtonModule, InputGroupModule, InputGroupAddonModule, TableModule, TooltipModule, ToastModule, InputTextModule],
  providers: [MessageService],
  templateUrl: './proveedor-perfil.component.html',
  styleUrl: './proveedor-perfil.component.scss'
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

  visibleEditar: boolean = false;  constructor(
    private route: ActivatedRoute,
    private entidadService: EntidadService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.entidadService.getProveedor(id).subscribe(data => {
      this.proveedor = data;
    });
  }
  showDialogEditar() {
    // Inicializar los campos de edición con los valores actuales del proveedor
    this.nombreEdicion = this.proveedor.nombre;
    this.telefonoEdicion = this.proveedor.telefono;
    this.correoEdicion = this.proveedor.correo;
    this.visibleEditar = true;
  }

  cerrarDialogEditar() {
    this.visibleEditar = false;
    // Resetear los campos a los valores originales
    this.nombreEdicion = '';
    this.telefonoEdicion = '';
    this.correoEdicion = '';
  }

  nombreEdicion: string = '';
  telefonoEdicion: string = '';
  correoEdicion: string = '';

  editarProveedor() {
    if (!this.nombreEdicion || !this.telefonoEdicion || !this.correoEdicion) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos incompletos',
        detail: 'Por favor, complete todos los campos obligatorios.'
      });
      return;
    }
    
    this.proveedor.nombre = this.nombreEdicion;
    
    this.proveedor.telefono = this.telefonoEdicion;

    this.proveedor.correo = this.correoEdicion;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.proveedor.correo)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Email inválido',
        detail: 'Por favor, ingrese un correo electrónico válido.'
      });
      return;
    }    

    this.entidadService.editarProveedor(this.proveedor).subscribe({
      next: (data: any) => {
        console.log('Proveedor editado:', data);
        this.messageService.add({
          severity: 'success',
          summary: 'Proveedor actualizado',
          detail: 'Los datos del proveedor se han actualizado correctamente.'
        });
        this.visibleEditar = false;
      },
      error: (err: any) => {
        console.error('Error al editar proveedor:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error al editar',
          detail: 'Ocurrió un error al actualizar los datos del proveedor.'
        });
      }
    });

  }

  verProducto(productoId: number) {
    if (productoId) {
      this.router.navigate(['/producto', productoId]);
    }
  }

}
