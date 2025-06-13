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

interface ComprasCliente {
  id: number;
  codigoBarras: string;
  nombre: string;
  stock: number;
}

@Component({
  selector: 'app-proveedor-perfil',
  imports: [FormsModule, DialogModule, CommonModule, HeaderComponent, FooterComponent, ButtonModule, InputGroupModule, InputGroupAddonModule, TableModule, TooltipModule],
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

  visibleEditar: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private entidadService: EntidadService,
    private router: Router
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

  nombreEdicion: string = '';
  telefonoEdicion: string = '';
  correoEdicion: string = '';


  editarProveedor() {
    if (!this.nombreEdicion || !this.telefonoEdicion || !this.correoEdicion) {
      alert('Por favor, complete todos los campos.');
      return;
    }
    
    this.proveedor.nombre = this.nombreEdicion;
    
    this.proveedor.telefono = this.telefonoEdicion;

    this.proveedor.correo = this.correoEdicion;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.proveedor.correo)) {
      alert('Por favor, ingrese un correo electrónico válido.');
      return;
    }    this.entidadService.editarProveedor(this.proveedor).subscribe({
      next: (data: any) => {
        console.log('Proveedor editado:', data);
        this.visibleEditar = false;
      },
      error: (err: any) => {
        console.error('Error al editar proveedor:', err);
        alert('Error al editar proveedor: ' + (err.message || err.status));
      }
    });

  }

  verProducto(productoId: number) {
    if (productoId) {
      this.router.navigate(['/producto', productoId]);
    }
  }

}
