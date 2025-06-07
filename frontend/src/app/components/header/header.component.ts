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
  imports: [MenubarModule, ButtonModule, NotificacionesComponent, MenuModule, OverlayPanelModule, TooltipModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
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
    //console.log('🔍 getter nombreUsuario llamado, valor:', this._nombreUsuario);
    return this._nombreUsuario;
  }

  get estaAutenticado(): boolean {
    return this.securityService.isLoggedIn();
  }
  private cargarUsuarioActual() {
    //console.log('🔍 cargarUsuarioActual llamado');
    //console.log('🔍 isLoggedIn:', this.securityService.isLoggedIn());
    
    if (this.securityService.isLoggedIn()) {
      //console.log('🔍 Usuario está logueado');
      const nombreUsuario = this.securityService.getUserName();
      //console.log('🔍 Nombre usuario obtenido:', nombreUsuario);
      
      if (nombreUsuario && nombreUsuario.trim() !== '') {
        this._nombreUsuario = '@' + nombreUsuario;
        //console.log('🔍 _nombreUsuario establecido:', this._nombreUsuario);
      } else {
        //console.log('❌ nombreUsuario está vacío o undefined');
        this._nombreUsuario = '@Usuario';
      }
    } else {
      //console.log('❌ Usuario no está logueado');
      this._nombreUsuario = '';
    }
    
    //console.log('🔍 Nombre usuario final:', this._nombreUsuario);
  }
  private configurarMenuItems() {
    this.menuItems = [
      {
        label: 'Inicio',
        icon: 'pi pi-home',
        command: () => this.router.navigate(['/home'])
      },
      {
        label: 'Ventas',
        icon: 'pi pi-shopping-cart',
        command: () => this.router.navigate(['/ventas'])
      },
      {
        label: 'Nueva Venta',
        icon: 'pi pi-plus',
        command: () => this.router.navigate(['/nuevaventa'])
      },
      {
        label: 'Estadísticas',
        icon: 'pi pi-chart-bar',
        command: () => this.router.navigate(['/stats'])
      },
      {
        separator: true
      },      {
        label: 'Productos',
        icon: 'pi pi-box',
        command: () => this.router.navigate(['/productos'])
      },
      {
        label: 'Clientes',
        icon: 'pi pi-users',
        command: () => this.router.navigate(['/clientes'])
      },
      {
        label: 'Proveedores',
        icon: 'pi pi-truck',
        command: () => this.router.navigate(['/proveedores'])
      },
      {
        label: 'Ofertas',
        icon: 'pi pi-percentage',
        command: () => this.router.navigate(['/ofertas'])
      },
      {
        label: 'Créditos',
        icon: 'pi pi-credit-card',
        command: () => this.mostrarMensaje('Créditos')
      }
    ];
  }

  mostrarMensaje(seccion: string) {
    alert(`La sección "${seccion}" estará disponible próximamente.`);
  }

  cerrarSesion() {
    this.securityService.logout();
  }
}
