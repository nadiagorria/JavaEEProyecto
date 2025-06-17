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
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-cliente-perfil',  imports: [FormsModule, 
    HeaderComponent, 
    FooterComponent, 
    ButtonModule, 
    InputGroupModule, 
    InputGroupAddonModule, 
    TableModule, 
    DialogModule, 
    CommonModule,
    InputTextModule,
    ToastModule],
  providers: [MessageService],
  templateUrl: './cliente-perfil.component.html',
  styleUrl: './cliente-perfil.component.scss'
})
export class ClientePerfilComponent {

  cliente!: ClienteDto;

  totalRecords: number = 0;
  constructor(
    private route: ActivatedRoute,
    private entidadService: EntidadService,
    private creditoService: CreditoService,
    private messageService: MessageService
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

  cerrarDialogEditar() {
    this.visibleEditar = false;
    // Resetear los campos a los valores originales
    this.nombreEdicion = '';
    this.telefonoEdicion = '';
  }

  pago : number = 0;
  pagoButton() {
    // Validar que el monto de pago no sea mayor a la deuda actual ni negativo
    if (this.pago <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Monto inválido',
        detail: 'El monto a pagar debe ser mayor a cero.'
      });
      return;
    }
    
    if (this.pago > this.cliente.credito.precioTotal) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Monto excesivo',
        detail: 'El monto a pagar no puede ser mayor a la deuda actual.'
      });
      return;
    }
    
    console.log(this.pago, "aaa", this.cliente.credito.id);
    this.creditoService.pagarCredito(this.cliente.credito.id, this.pago).subscribe(
      response => {
        // Manejar respuesta si es necesario
        console.log('Pago realizado', response);
        // Refrescar los datos del cliente después del pago
        this.entidadService.getCliente(this.cliente.id).subscribe(data => {
          this.cliente = data;
          this.messageService.add({
            severity: 'success',
            summary: 'Pago exitoso',
            detail: `Pago de $${this.pago} realizado correctamente.`
          });
        });
      },
      error => {
        // Manejar error si ocurre
        console.error('Error al pagar', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error en el pago',
          detail: 'Ocurrió un error al procesar el pago. Intente nuevamente.'
        });
      }
    );
    this.visible = false;
    // Resetear el valor del pago
    this.pago = 0;
  }

  nombreEdicion: string = '';
  telefonoEdicion: string = '';
  editarCliente() {
    if (!this.nombreEdicion || !this.telefonoEdicion) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos incompletos',
        detail: 'Por favor, complete todos los campos obligatorios.'
      });
      return;
    }

    this.cliente.nombre = this.nombreEdicion;
    
    this.cliente.telefono = this.telefonoEdicion;

    this.entidadService.editarCliente(this.cliente).subscribe({
      next: (data: any) => {
        console.log('Cliente editado:', data);
        this.messageService.add({
          severity: 'success',
          summary: 'Cliente actualizado',
          detail: 'Los datos del cliente se han actualizado correctamente.'
        });
        this.visibleEditar = false;
      },
      error: (err: any) => {
        console.error('Error al editar cliente:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error al editar',
          detail: 'Ocurrió un error al actualizar los datos del cliente.'
        });
      }
    });
  }

}
