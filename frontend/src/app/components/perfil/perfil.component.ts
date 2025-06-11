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
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
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
  standalone: true,  imports: [
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
    PasswordModule,
    TooltipModule,
    ToastModule
  ],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
  providers: [MessageService]
})
export class PerfilComponent implements OnInit {
  usuario = {
    nombreUsuario: '',
    roles: [] as string[],
    email: '',
    avatar: '/placeholder-image.webp',
    avatarColor: '#6366f1' // Color del icono del avatar
  };
  
  // Colores disponibles para el avatar
  private avatarColors = [
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
    '#06b6d4', // Cyan
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#ec4899', // Pink
    '#84cc16', // Lime
    '#f97316', // Orange
    '#3b82f6'  // Blue
  ];
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
    private ventaService: VentaService,
    private messageService: MessageService
  ) {
    // Generar color aleatorio para el avatar al cargar el componente
    this.generateRandomAvatarColor();
  }

  // Generar color aleatorio para el avatar
  generateRandomAvatarColor(): void {
    const randomIndex = Math.floor(Math.random() * this.avatarColors.length);
    this.usuario.avatarColor = this.avatarColors[randomIndex];
  }isAdmin(): boolean {
    return this.usuario.roles.includes('ADMIN');
  }

  isExclusiveAdmin(): boolean {
    return this.usuario.roles.length === 1 && this.usuario.roles.includes('ADMIN');
  }

  isDefaultAdmin(): boolean {
    return this.usuario.nombreUsuario === 'admin';
  }

  puedeOtorgarPermisos(usuario: UsuarioTabla): boolean {
    return this.isDefaultAdmin() && 
           usuario.roles.length === 1 && 
           usuario.roles.includes('CAJERO') &&
           usuario.nombre !== 'admin';
  }

  puedeRevocarPermisos(usuario: UsuarioTabla): boolean {
    return this.isDefaultAdmin() && 
           usuario.roles.includes('ADMIN') && 
           usuario.roles.includes('CAJERO') &&
           usuario.nombre !== 'admin';
  }  otorgarPermisos(nombreUsuario: string): void {
    this.usuarioService.otorgarRolAdmin(nombreUsuario).subscribe({
      next: (response: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Permisos Otorgados',
          detail: 'Permisos de administrador otorgados exitosamente',
          life: 4000
        });
        this.cargarUsuarios(); // Recargar lista
      },
      error: (error: any) => {
        console.error('Error al otorgar permisos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error al Otorgar Permisos',
          detail: error.error || 'Error al otorgar permisos de administrador',
          life: 5000
        });
      }
    });
  }

  revocarPermisos(nombreUsuario: string): void {
    this.usuarioService.revocarRolAdmin(nombreUsuario).subscribe({
      next: (response: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Permisos Revocados',
          detail: 'Permisos de administrador revocados exitosamente',
          life: 4000
        });
        this.cargarUsuarios(); // Recargar lista
      },
      error: (error: any) => {
        console.error('Error al revocar permisos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error al Revocar Permisos',
          detail: error.error || 'Error al revocar permisos de administrador',
          life: 5000
        });
      }
    });
  }

  cargarUsuarios(): void {
    if (!this.isExclusiveAdmin()) return;

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
          }          // Si es admin exclusivo, cargar la lista de usuarios
          if (this.isExclusiveAdmin()) {
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
  }  isValidForm(): boolean {
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
      
      // New password cannot be the same as current password
      if (this.editForm.newPassword === this.editForm.currentPassword) {
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
      this.messageService.add({
        severity: 'error',
        summary: 'Error de Validación',
        detail: 'Las contraseñas no coinciden',
        life: 4000
      });
      return;
    }

    // Validación de nueva contraseña igual a la actual
    if (this.editForm.newPassword && this.editForm.newPassword === this.editForm.currentPassword) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Contraseña Duplicada',
        detail: 'La nueva contraseña debe ser diferente a la actual',
        life: 4000
      });
      return;
    }

    if (!this.editForm.currentPassword) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo Requerido',
        detail: 'Debe ingresar su contraseña actual',
        life: 4000
      });
      return;
    }

    const cambios = {
      email: this.editForm.email,
      currentPassword: this.editForm.currentPassword,
      newPassword: this.editForm.newPassword || this.editForm.currentPassword
    };

    this.loading = true;
    this.usuarioService.modificarUsuario(this.usuario.nombreUsuario, cambios).subscribe({
      next: (response: any) => {
        if (typeof response === 'string' && response.includes('modificado')) {
          this.usuario.email = this.editForm.email;
          this.showEditDialog = false;
          this.loading = false;
          
          this.messageService.add({
            severity: 'success',
            summary: 'Perfil Actualizado',
            detail: 'Los cambios se han guardado correctamente',
            life: 4000
          });
          
          // Actualizar datos del usuario en el servicio de seguridad
          if (this.securityService.user) {
            this.securityService.user.email = this.editForm.email;
          }
        } else {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error del Servidor',
            detail: 'Respuesta inesperada del servidor',
            life: 4000
          });
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al actualizar perfil:', error);
        
        let errorMessage = 'Error al actualizar el perfil';
        let severity = 'error';
        let summary = 'Error de Actualización';
        
        if (error.error && typeof error.error === 'string') {
          if (error.error.includes('Contraseña actual incorrecta')) {
            summary = 'Contraseña Incorrecta';
            errorMessage = 'La contraseña actual que ingresaste no es correcta';
            severity = 'warn';
          } else {
            errorMessage = error.error;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
          this.messageService.add({
          severity: severity,
          summary: summary,
          detail: errorMessage,
          life: 5000
        });
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
