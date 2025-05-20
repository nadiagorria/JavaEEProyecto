import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Venta {
  id: string;
  cliente: string;
  fecha: string;
  total: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true, // ✅ componente standalone
  imports: [CommonModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent {
  usuario = {
    nombre: 'Nombre usuario',
    tipoCuenta: 'Tipo de cuenta',
    email: 'usuario@ejemplo.com',
    avatar: 'https://via.placeholder.com/120'
  };

  ventas: Venta[] = [
    { id: 'IN/1001/23', cliente: 'ACME', fecha: '2022-01-23', total: '$2,350.00' },
    { id: 'IN/1002/23', cliente: 'John Doe Ltd.', fecha: '2022-01-09', total: '$1,500.00' },
    // puedes añadir más ventas aquí
  ];

  totalVentas = 406; // total simulado
  rangoInicio = 1;
  rangoFin = 10;

  paginaAnterior() {
    if (this.rangoInicio > 1) {
      this.rangoInicio -= 10;
      this.rangoFin -= 10;
    }
  }

  paginaSiguiente() {
    if (this.rangoFin < this.totalVentas) {
      this.rangoInicio += 10;
      this.rangoFin += 10;
    }
  }

  editarCuenta() {
    // lógica para editar cuenta
    console.log('Editar cuenta');
  }

  cerrarSesion() {
    // lógica para cerrar sesión
    console.log('Cerrar sesión');
  }
}
