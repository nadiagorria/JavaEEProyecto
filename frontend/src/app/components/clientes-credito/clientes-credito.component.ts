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
  selector: 'app-clientes-credito',
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
  templateUrl: './clientes-credito.component.html',
  styleUrl: './clientes-credito.component.scss'
})

export class ClientesCreditoComponent {

  creditos: CreditoDto[] = [];
  creditosFiltrados: CreditoDto[] = [];

  totalRecords: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private creditoService: CreditoService,
    private entidadService: EntidadService
  ) {}
  ngOnInit(): void {
    this.cargarCreditos();
  }

  cargarCreditos(): void {
    this.creditoService.listarCreditos().subscribe({
      next: (data: any) => {
        this.creditos = data.creditos;
        this.creditosFiltrados = [...this.creditos];
        this.totalRecords = this.creditos.length;
      },
      error: (err: any) => {
        console.error('Error al listar créditos:', err);
        alert('Error al listar créditos: ' + (err.message || err.status));
      }
    });
  }

  visible: boolean = false;

  mostarModal(){
    this.visible = true;
  }

  //Cliente
  nombre: string = '';
  telefono: string = '';

  //Credito
  minimo: number = 0;
  maximo: number = 0;
  
  saveCliente() {
    // Validar que los campos requeridos estén completos
    if (!this.nombre || !this.telefono) {
      alert('Por favor, complete al menos el nombre y teléfono del cliente.');
      return;
    }

    const clienteCreditoDto: clienteCreditoDto = {
      nombre: this.nombre,
      telefono: this.telefono,
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
        
        // Actualizar la lista de créditos sin recargar la página
        this.cargarCreditos();
      },
      error: (err: any) => {
        console.error('Error al crear cliente y crédito:', err);
        let mensajeError = 'Error al crear cliente y crédito';
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

  buscarCliente() {
    if (this.busqueda.trim() === '') {
      // Si la búsqueda está vacía, mostrar todos los créditos
      this.creditosFiltrados = [...this.creditos];
    } else {
      // Filtrar los créditos por nombre de cliente sin hacer una nueva petición
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
          
          // Actualizar las listas filtrando el cliente eliminado
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
}
