import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { clienteCreditoDto } from 'src/models/clienteCredito.dto';  
import { CreditoDto } from 'src/models/credito.dto';
import { CreditoService } from 'src/services/credito.service';
import { EntidadService } from 'src/services/entidad.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProveedorDto } from 'src/models/proveedor.dto';
import { SecurityService } from 'src/services/security.service';


@Component({
  selector: 'app-proveedores',
  imports: [FormsModule, 
    HeaderComponent,
    FooterComponent,
    InputGroupModule,
    InputGroupAddonModule,
    ButtonModule,
    MenuModule,
    TableModule,
    DialogModule,
    ],
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.scss'
})

export class ProveedoresComponent {

  proveedores: ProveedorDto[] = [];
  proveedoresFiltrados: ProveedorDto[] = [];
  totalRecords: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private creditoService: CreditoService,
    private entidadService: EntidadService,
    private securityService: SecurityService
  ) {}

  ngOnInit(): void {
    if (!this.securityService.isLoggedIn()) {
      // Si no está autenticado, redirigir al login
      this.router.navigate(['/login']);
      return;
    }
    this.cargarProveedores();
  }

  cargarProveedores(): void {
    this.entidadService.listarProveedores().subscribe({
      next: (data: any) => {
        
        if (data && Array.isArray(data)) {
          this.proveedores = data;
        } else if (data && data.proveedores && Array.isArray(data.proveedores)) {
        
          this.proveedores = data.proveedores;
        } else {
          console.warn('La respuesta no tiene el formato esperado:', data);
          this.proveedores = [];
        }
        this.proveedoresFiltrados = [...this.proveedores];
        this.totalRecords = this.proveedores.length;
      },
      error: (err: any) => {
        console.error('Error al listar proveedores:', err);
        
        if (err.status === 403) {
          // Error de autorización, probablemente la sesión expiró
          alert('Sesión expirada o sin autorización. Por favor, inicie sesión nuevamente.');
          this.securityService.logout();
          return;
        }
        
        alert('Error al listar proveedores: ' + (err.message || err.status));
        this.proveedores = [];
        this.proveedoresFiltrados = [];
        this.totalRecords = 0;
      }
    });
  }

  visible: boolean = false;

  mostarModal(){
    this.visible = true;
  }

  //Proveedor
  nombre: string = '';
  telefono: string = '';
  correo: string = '';
  

  saveProveedor() {

    if (!this.nombre || !this.telefono || !this.correo) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    const proveedor: ProveedorDto = {
      id: null,
      nombre: this.nombre,
      telefono: this.telefono,
      correo: this.correo,
      productosDto: [],
      activo: true,
    };
        this.entidadService.crearProveedor(proveedor).subscribe({
      next: (data: any) => {
        this.visible = false;
        this.nombre = '';
        this.telefono = '';
        this.correo = ''; 
        console.log('Proveedor creado exitosamente', data);
        
        // Actualizar la lista de proveedores sin recargar la página
        this.cargarProveedores();
      },      error: (err: any) => {
        console.error('Error al crear proveedor:', err);
        let mensajeError = 'Error al crear proveedor';
        if (err.error && typeof err.error === 'string') {
          mensajeError += ': ' + err.error;
        } else if (err.message) {
          mensajeError += ': ' + err.message;
        }
        alert(mensajeError);
      }
    });
  }
  busqueda: string = '';

  buscarProveedor() {
    if (this.busqueda.trim() === '') {
      this.proveedoresFiltrados = [...this.proveedores];
    } else {
      this.proveedoresFiltrados = this.proveedores.filter(proveedor => 
        proveedor.nombre.toLowerCase().includes(this.busqueda.toLowerCase())
      );
    }
    this.totalRecords = this.proveedoresFiltrados.length;
  }
  
  mostrarDetalles(id: number){
    this.router.navigate(['/proveedor', id]);
  }

  eliminarProveedor(id: number) {
    if (confirm('¿Está seguro que desea eliminar este proveedor?')) {

      const proveedor = this.proveedores.find(p => p.id === id);

      this.entidadService.eliminarPersona(id).subscribe({
        next: (data: any) => {
          console.log('Proveedor eliminado exitosamente', data);
          
          // Actualizar la lista de proveedores sin recargar la página
          this.proveedores = this.proveedores.filter(p => p.id !== id);
          this.proveedoresFiltrados = this.proveedoresFiltrados.filter(p => p.id !== id);
          this.totalRecords = this.proveedoresFiltrados.length;
        },
        error: (err: any) => {
          console.error('Error al eliminar proveedor:', err);
          let mensajeError = 'Error al eliminar proveedor';
          if (err.error && typeof err.error === 'string') {
            mensajeError += ': ' + err.error;
          } else if (err.message) {
            mensajeError += ': ' + err.message;
          }
          alert(mensajeError);
        }
      });
    }
  }
}
