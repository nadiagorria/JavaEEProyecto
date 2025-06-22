import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { clienteCreditoDto } from 'src/models/clienteCredito.dto';  
import { CreditoDto } from 'src/models/credito.dto';
import { CreditoService } from 'src/services/credito.service';
import { EntidadService } from 'src/services/entidad.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SecurityService } from 'src/services/security.service';

interface ClienteCredito {
  id: number;
  nombre: string;
  telefono: string;
  min: number;
  max: number;
  deuda: number;
  pago: number;
}

@Component({
  selector: 'app-clientes-credito',  imports: [
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
    ],
  providers: [MessageService],
  templateUrl: './clientes-credito.component.html',
  styleUrl: './clientes-credito.component.scss'
})

export class ClientesCreditoComponent {

  creditos: CreditoDto[] = [];
  creditosFiltrados: CreditoDto[] = [];

  totalRecords: number = 0;  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private creditoService: CreditoService,
    private entidadService: EntidadService,
    private securityService: SecurityService,
    private messageService: MessageService
  ) {}
  
  ngOnInit(): void {
    if (!this.securityService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.cargarCreditos();
  }
  
  cargarCreditos(): void {
    this.creditoService.listarCreditos().subscribe({
      next: (data: any) => {
        
        if (data && Array.isArray(data)) {
          this.creditos = data;
        } else if (data && data.creditos && Array.isArray(data.creditos)) {
          this.creditos = data.creditos;
        } else {
          console.warn('La respuesta no tiene el formato esperado:', data);
          this.creditos = [];
        }
        
        this.creditosFiltrados = [...this.creditos];
        this.totalRecords = this.creditos.length;
        console.log('Créditos cargados:', this.creditos); // Para debugging
      },      error: (err: any) => {
        console.error('Error al listar créditos:', err);
        
        if (err.status === 403) {

          alert('Sesión expirada o sin autorización. Por favor, inicie sesión nuevamente.');
          this.securityService.logout();
          return;
        }
        
        alert('Error al listar créditos: ' + (err.message || err.status));
        this.creditos = [];
        this.creditosFiltrados = [];
        this.totalRecords = 0;
      }
    });
  }

  visible: boolean = false;

  mostarModal(){
    this.visible = true;
  }

  cerrarDialog() {
    this.visible = false;

    this.nombre = '';
    this.telefono = '';
    this.minimo = 0;
    this.maximo = 0;
  }

  nombre: string = '';
  telefono: string = '';


  minimo: number = 0;
  maximo: number = 0;
  
  saveCliente() {

    if (!this.nombre || this.nombre.trim() === '') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'El nombre del cliente es obligatorio'
      });
      return;
    }


    if (this.maximo > 0 && this.minimo > 0 && this.maximo <= this.minimo) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación de créditos',
        detail: 'El crédito máximo debe ser mayor que el crédito mínimo'
      });
      return;
    }


    if (this.minimo < 0 || this.maximo < 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación de montos',
        detail: 'Los montos de crédito no pueden ser negativos'
      });
      return;
    }

    const clienteCreditoDto: clienteCreditoDto = {
      nombre: this.nombre.trim(),
      telefono: this.telefono.trim(),
      precioTotal: 0,
      pagoHastaAhora: 0,
      minimo: this.minimo,
      maximo: this.maximo,
    };

    this.entidadService.crearClienteCredito(clienteCreditoDto).subscribe({
      next: (data: any) => {
        this.visible = false;
        this.nombre = '';
        this.telefono = '';
        this.minimo = 0;
        this.maximo = 0;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Cliente a crédito creado exitosamente'
        });
        

        this.cargarCreditos();
      },
      error: (err: any) => {
        console.error('Error al crear cliente y crédito:', err);
        let mensajeError = 'Error al crear cliente y crédito';
        if (err.error && typeof err.error === 'string') {
          mensajeError = err.error;
        } else if (err.message) {
          mensajeError = err.message;
        }
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: mensajeError
        });
      }
    });
  }
  busqueda: string = '';

  buscarCliente() {
    if (this.busqueda.trim() === '') {

      this.creditosFiltrados = [...this.creditos];
    } else {

      this.creditosFiltrados = this.creditos.filter((credito: CreditoDto) =>
        credito.cliente.nombre.toLowerCase().includes(this.busqueda.toLowerCase())
      );
    }
    this.totalRecords = this.creditosFiltrados.length;
  }

  mostrarDetalles(id: number){
    this.router.navigate(['/cliente', id]);
  }

  eliminarCliente(id: number) {
    if (confirm('¿Está seguro que desea eliminar este cliente?')) {
      this.entidadService.eliminarPersona(id).subscribe({
        next: (data: any) => {
          console.log('Cliente eliminado exitosamente', data);
          

          this.creditos = this.creditos.filter(c => c.cliente.id !== id);
          this.creditosFiltrados = this.creditosFiltrados.filter(c => c.cliente.id !== id);
          this.totalRecords = this.creditosFiltrados.length;

          this.cargarCreditos();
          
          alert('Cliente eliminado exitosamente');
        },
        error: (err: any) => {
          console.error('Error al eliminar cliente:', err);
          let mensajeError = 'Error al eliminar cliente';
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

  isAdmin(): boolean {
    const roles = this.securityService.getUserRoles();
    
    if (!roles) {
      return false;
    }
    
    const hasAdminRole = roles.includes('ADMIN');
    
    return hasAdminRole;
  }
}
