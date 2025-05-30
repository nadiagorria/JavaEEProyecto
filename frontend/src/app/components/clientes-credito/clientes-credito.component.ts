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
import { ClienteService } from 'src/services/entidad.service';
import { ActivatedRoute } from '@angular/router';
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

  totalRecords: number = 0;

  constructor(
    private route: ActivatedRoute,
    private creditoService: CreditoService,
    private clienteService: ClienteService
  ) {}

  ngOnInit(): void {
    this.creditoService.listarCreditos().subscribe({
      next: (data: any) => {
        this.creditos = data.creditos;
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
  deuda: number = 0;
  pago: number = 0;

  saveCliente() {

    const clienteCreditoDto: clienteCreditoDto = {
      nombre: this.nombre,
      telefono: this.telefono,
      precioTotal: this.deuda,
      pagoHastaAhora: this.pago,
      minimo: this.minimo,
      maximo: this.maximo,
    };

    this.clienteService.crearClienteCredito(clienteCreditoDto).subscribe({
      next: (data: any) => {
        this.creditos.push(data.credito);
        this.visible = false;
        this.nombre = '';
        this.telefono = '';
        this.minimo = 0;
        this.maximo = 0;
        this.deuda = 0;
        this.pago = 0;
        window.location.reload();
      },
      error: (err: any) => {
        console.error('Error al crear cliente y crédito:', err);
        alert('Error al crear cliente y crédito: ' + (err.message || err.status));
      }
    });
  }

  busqueda: string = '';

  buscarCliente() {
    if (this.busqueda.trim() === '') {
      this.creditoService.listarCreditos().subscribe({
        next: (data: any) => {
          this.creditos = data.creditos;
        },
        error: (err: any) => {
          console.error('Error al listar créditos:', err);
          alert('Error al listar créditos: ' + (err.message || err.status));
        }
      });
    } else {
      this.creditoService.listarCreditos().subscribe({
        next: (data: any) => {
          this.creditos = data.creditos.filter((credito: CreditoDto) =>
            credito.cliente.nombre.toLowerCase().includes(this.busqueda.toLowerCase())
          );
        },
        error: (err: any) => {
          console.error('Error al buscar créditos:', err);
          alert('Error al buscar créditos: ' + (err.message || err.status));
        }
      });
    }
  }
}
