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
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { UsuarioService } from '../../../services/usuario.service';
import { VentaService } from '../../../services/venta.service';

interface VentaPerfil {
  id: number | null;
  fechaVenta: Date;
  total: number;
  formaPago: string;
}

interface UsuarioTabla {
  nombre: string;
  mail: string;
  roles: string[];
  activo: boolean;
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
    TagModule,
    DialogModule,
    FormsModule,
    InputTextModule,
    PasswordModule
  ],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  usuario = {
    nombreUsuario: '',
    roles: [] as string[],
    email: '',
    avatar: '/placeholder-image.webp'
  };
  ventas: VentaPerfil[] = [];
  totalVentas = 0;  // total simulado por ahora
  rangoInicio = 1;
  rangoFin = 10;

  usuarios: UsuarioTabla[] = [];
  totalUsuarios = 0;
  showEditDialog = false;  editForm = {
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  loading = false;
  formErrors = {
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private securityService: SecurityService,
    private router: Router,
    private usuarioService: UsuarioService,
    private ventaService: VentaService
  ) {}  isAdmin(): boolean {
    return this.usuario.roles.includes('ADMIN');
  }
  cargarUsuarios(): void {
    if (!this.isAdmin()) return;

    this.usuarioService.obtenerTodosLosUsuarios().subscribe({
      next: (response: any) => {
        if (response && response.usuarios) {
          this.usuarios = response.usuarios.map((u: any) => ({
            nombre: u.nombre,
            mail: u.mail,
            roles: u.roles.map((r: any) => r.nombre),
            activo: u.activo
          }));
          this.totalUsuarios = this.usuarios.length;
        }
      },
      error: (error: any) => {
        console.error('Error al cargar usuarios:', error);
      }
    });
  }

  ngOnInit(): void {
    // Solo mostrar el perfil si el usuario está autenticado
    if (!this.securityService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Obtener el nombre de usuario del servicio de seguridad
    if (this.securityService.user) {
      const nombreUsuario = this.securityService.user.nombreUsuario;
      
      // Cargar los datos completos del usuario incluyendo sus ventas
      this.usuarioService.obtenerUsuarioPorNombre(nombreUsuario).subscribe({
        next: (userData: any) => {
          // Actualizar datos del usuario
          this.usuario.nombreUsuario = userData.nombre;
          this.usuario.roles = userData.roles.map((r: any) => r.nombre);
          this.usuario.email = userData.mail;
          
          // Procesar las ventas
          if (userData.ventas) {
            this.ventas = userData.ventas
              .sort((a: any, b: any) => new Date(b.fechaVenta).getTime() - new Date(a.fechaVenta).getTime());
            this.totalVentas = this.ventas.length;
          }

          // Si es admin, cargar la lista de usuarios
          if (this.isAdmin()) {
            this.cargarUsuarios();
          }
        },
        error: (error) => {
          console.error('Error al cargar datos del usuario:', error);
          alert('Error al cargar los datos del perfil');
        }
      });
    }
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
    this.editForm.email = this.usuario.email;
    this.editForm.currentPassword = '';
    this.editForm.newPassword = '';
    this.editForm.confirmPassword = '';
    this.showEditDialog = true;
  }
  isValidEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(email);
  }
  isValidForm(): boolean {
    // Validate email
    if (!this.editForm.email || !this.isValidEmail(this.editForm.email)) {
      return false;
    }
    
    // Validate current password
    if (!this.editForm.currentPassword) {
      return false;
    }
    
    // Validate new password if provided
    if (this.editForm.newPassword) {
      // Password must be at least 6 characters
      if (this.editForm.newPassword.length < 6) {
        return false;
      }
      
      // Passwords must match
      if (this.editForm.newPassword !== this.editForm.confirmPassword) {
        return false;
      }
    }
    
    return true;
  }

  guardarCambios() {
    if (!this.isValidForm()) {
      return;
    }

    // Validación de contraseñas
    if (this.editForm.newPassword && this.editForm.newPassword !== this.editForm.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (!this.editForm.currentPassword) {
      alert('Debe ingresar su contraseña actual');
      return;
    }

    const cambios = {
      email: this.editForm.email,
      currentPassword: this.editForm.currentPassword,
      newPassword: this.editForm.newPassword || this.editForm.currentPassword
    };    this.loading = true;
    this.usuarioService.modificarUsuario(this.usuario.nombreUsuario, cambios).subscribe({
      next: (response: any) => {
        if (typeof response === 'string' && response.includes('modificado')) {
          this.usuario.email = this.editForm.email;
          this.showEditDialog = false;
          this.loading = false;
          alert('Perfil actualizado con éxito');
          
          // Actualizar datos del usuario en el servicio de seguridad
          if (this.securityService.user) {
            this.securityService.user.email = this.editForm.email;
          }
        } else {
          this.loading = false;
          alert('Error al actualizar el perfil: Respuesta inesperada del servidor');
        }
      },      error: (error) => {
        this.loading = false;
        console.error('Error al actualizar perfil:', error);
        let errorMessage = 'Error al actualizar el perfil';
        if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        alert(errorMessage);
      }
    });
  }

  cerrarDialog() {
    this.showEditDialog = false;
  }

  cerrarSesion() {
    // Remove user data and navigate to login
    this.securityService.logout();
    this.router.navigate(['/login']);
  }

  verDetalleVenta(ventaId: number | null) {
    if (ventaId) {
      this.ventaService.obtenerVenta(ventaId).subscribe({
        next: (ventaDetalle) => {
          // Aquí podrías mostrar un diálogo con los detalles de la venta
          console.log('Detalles de la venta:', ventaDetalle);
          alert(`Venta ID: ${ventaId}\nTotal: $${ventaDetalle.total}\nFecha: ${new Date(ventaDetalle.fechaVenta).toLocaleString()}`);
        },
        error: (error) => {
          console.error('Error al obtener detalles de la venta:', error);
          alert('Error al obtener los detalles de la venta');
        }
      });
    }
  }
}
