import { Component, Input, OnInit } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { NotificacionesComponent } from '../notificaciones/notificaciones.component';
import { SecurityService } from '../../../services/security.service';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [
    MenubarModule,
    ButtonModule,
    NotificacionesComponent,
    MenuModule,
    OverlayPanelModule,
    TooltipModule,
    CommonModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  private _nombreUsuario = '';
  menuItems: MenuItem[] = [];

  constructor(
    private securityService: SecurityService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarUsuarioActual();
    this.configurarMenuItems();
  }

  @Input()
  set nombreUsuario(valor: string) {
    this._nombreUsuario = '@' + valor;
  }
  get nombreUsuario(): string {
    return this._nombreUsuario;
  }

  get estaAutenticado(): boolean {
    return this.securityService.isLoggedIn();
  }
  private cargarUsuarioActual() {
    if (this.securityService.isLoggedIn()) {
      const nombreUsuario = this.securityService.getUserName();

      if (nombreUsuario && nombreUsuario.trim() !== '') {
        this._nombreUsuario = '@' + nombreUsuario;
      } else {
        this._nombreUsuario = '@Usuario';
      }
    } else {
      this._nombreUsuario = '';
    }
  }
  private configurarMenuItems() {
    this.menuItems = [
      {
        label: 'Inicio',
        icon: 'pi pi-home',
        command: () => this.router.navigate(['/home']),
      },
      {
        label: 'Ventas',
        icon: 'pi pi-shopping-cart',
        command: () => this.router.navigate(['/ventas']),
      },
      {
        label: 'Nueva Venta',
        icon: 'pi pi-plus',
        command: () => this.router.navigate(['/nuevaventa']),
      },
    ];

    if (this.isAdmin()) {
      this.menuItems.push({
        label: 'Estadísticas',
        icon: 'pi pi-chart-bar',
        command: () => this.router.navigate(['/stats']),
      });
    }

    this.menuItems.push(
      {
        separator: true,
      },
      {
        label: 'Productos',
        icon: 'pi pi-box',
        command: () => this.router.navigate(['/productos']),
      },
      {
        label: 'Clientes',
        icon: 'pi pi-users',
        command: () => this.router.navigate(['/clientes']),
      },
      {
        label: 'Proveedores',
        icon: 'pi pi-truck',
        command: () => this.router.navigate(['/proveedores']),
      },
      {
        label: 'Ofertas',
        icon: 'pi pi-percentage',
        command: () => this.router.navigate(['/ofertas']),
      }
    );
  }

  isAdmin(): boolean {
    const roles = this.securityService.getUserRoles();

    if (!roles) {
      return false;
    }

    const hasAdminRole = roles.includes('ADMIN');

    return hasAdminRole;
  }

  navegarA(ruta: string): void {
    this.router.navigate([ruta]);
  }

  cerrarSesion() {
    this.securityService.logout();
  }
}
