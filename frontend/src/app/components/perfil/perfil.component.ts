import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecurityService } from '../../../services/security.service';
import { Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';

interface Venta {
  id: string;
  cliente: string;
  fecha: string;
  total: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule, 
    HeaderComponent, 
    FooterComponent,
    CardModule,
    ButtonModule,
    TableModule,
    AvatarModule,
    TagModule
  ],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {  usuario = {
    nombreUsuario: '',
    roles: [] as string[],
    email: '',
    avatar: '/placeholder-image.webp'  // Placeholder local
  };

  ventas: Venta[] = [
    { id: 'IN/1001/23', cliente: 'ACME', fecha: '2022-01-23', total: '$2,350.00' },
    { id: 'IN/1002/23', cliente: 'John Doe Ltd.', fecha: '2022-01-09', total: '$1,500.00' },
  ];

  totalVentas = 406;  // total simulado por ahora
  rangoInicio = 1;
  rangoFin = 10;

  constructor(
    private securityService: SecurityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Solo mostrar el perfil si el usuario está autenticado
    if (!this.securityService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }    // Cargar los datos del usuario desde el servicio
    if (this.securityService.user) {
      this.usuario.nombreUsuario = this.securityService.user.nombreUsuario;
      this.usuario.roles = this.securityService.user.roles;
      this.usuario.email = this.securityService.user.email;
    }

    // Aquí se cargarían las ventas desde el servicio correspondiente
    // Ejemplo: this.ventasService.obtenerVentasUsuario().subscribe(...)
  }

  getRoleSeverity(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'danger';
      case 'cajero':
        return 'info';
      default:
        return 'warning';
    }
  }

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
    // TODO: Implementar edición de cuenta cuando esté disponible en el backend
    console.log('Editar cuenta');
  }

  cerrarSesion() {
    // Remove user data and navigate to login
    this.securityService.logout();
    this.router.navigate(['/login']);
  }
}
