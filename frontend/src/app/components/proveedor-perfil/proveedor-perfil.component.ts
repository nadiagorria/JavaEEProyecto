import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TableModule } from 'primeng/table';
import { EntidadService } from 'src/services/entidad.service';
import { ActivatedRoute } from '@angular/router';
import { ProveedorDto } from 'src/models';

interface ComprasCliente {
  id: number;
  codigoBarras: string;
  nombre: string;
  stock: number;
}

@Component({
  selector: 'app-proveedor-perfil',
  imports: [HeaderComponent, FooterComponent, ButtonModule, InputGroupModule, InputGroupAddonModule, TableModule],
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

  constructor(
    private route: ActivatedRoute,
    private entidadService: EntidadService,
  ) {}
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.entidadService.getProveedor(id).subscribe({
      next: (data) => {
        this.proveedor = data;
      },
      error: (error) => {
        console.error('Error al cargar proveedor:', error);
        if (error.status === 403) {
          alert('No tienes permisos para ver este proveedor');
        } else if (error.status === 404) {
          alert('Proveedor no encontrado');
        } else {
          alert('Error al cargar los datos del proveedor');
        }
      }
    });
  }

}
