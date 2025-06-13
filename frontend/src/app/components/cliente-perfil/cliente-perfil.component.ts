import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TableModule } from 'primeng/table';
import { ClienteDto } from 'src/models/cliente.dto';
import { EntidadService } from 'src/services/entidad.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { CreditoService } from 'src/services/credito.service';

@Component({
  selector: 'app-cliente-perfil',
  imports: [FormsModule, 
    HeaderComponent, 
    FooterComponent, 
    ButtonModule, 
    InputGroupModule, 
    InputGroupAddonModule, 
    TableModule, 
    DialogModule, 
    CommonModule],
  templateUrl: './cliente-perfil.component.html',
  styleUrl: './cliente-perfil.component.scss'
})
export class ClientePerfilComponent {

  cliente!: ClienteDto;

  totalRecords: number = 0;

  constructor(
    private route: ActivatedRoute,
    private entidadService: EntidadService,
    private creditoService: CreditoService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.entidadService.getCliente(id).subscribe(data => {
      this.cliente = data;
    });
  }

  visible: boolean = false;
  visibleEditar: boolean = false;

  showDialog() {
    this.visible = true;
  }
  showDialogEditar() {
    // Inicializar los campos de edición con los valores actuales del cliente
    this.nombreEdicion = this.cliente.nombre;
    this.telefonoEdicion = this.cliente.telefono;
    this.visibleEditar = true;
  }

  pago : number = 0;

  pagoButton() {
    console.log(this.pago, "aaa", this.cliente.credito.id);
    this.creditoService.pagarCredito(this.cliente.credito.id, this.pago).subscribe(
      response => {
        // Manejar respuesta si es necesario
        console.log('Pago realizado', response);
      },
      error => {
        // Manejar error si ocurre
        console.error('Error al pagar', error);
      }
    );
    this.visible = false;
  }

  nombreEdicion: string = '';
  telefonoEdicion: string = '';

  editarCliente() {
    if (!this.nombreEdicion || !this.telefonoEdicion) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    this.cliente.nombre = this.nombreEdicion;
    
    this.cliente.telefono = this.telefonoEdicion;

    this.entidadService.editarCliente(this.cliente).subscribe({
      next: (data: any) => {
        console.log('Cliente editado:', data);
        this.visibleEditar = false;
      },
      error: (err: any) => {
        console.error('Error al editar cliente:', err);
        alert('Error al editar cliente: ' + (err.message || err.status));
      }
    });
  }

}
