import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { RecuperarPasswordComponent } from './components/recuperar-password/recuperar-password.component';
import { NuevaventaComponent } from './components/nuevaventa/nuevaventa.component';
import { VerventaComponent } from './components/verventa/verventa.component';
import { VentasComponent } from './components/ventas/ventas.component';
import { ClientePerfilComponent } from './components/cliente-perfil/cliente-perfil.component';
import { ProductosComponent } from './components/productos/productos.component';
import { ProductoInfoComponent } from './components/producto-info/producto-info.component';
import { ProveedoresComponent } from './components/proveedores/proveedores.component';
import { HomeComponent } from './components/home/home.component';
import { StatsComponent } from './components/stats/stats.component';
import { AuthGuard } from 'src/guards/auth.guard';
import { CanDeactivateGuard } from './guards/can-deactivate.guard';
import { ClientesCreditoComponent } from './components/clientes-credito/clientes-credito.component';

import { ProveedorPerfilComponent } from './components/proveedor-perfil/proveedor-perfil.component';

import { PerfilComponent } from './components/perfil/perfil.component';
import { OfertasComponent } from './components/ofertas/ofertas.component';
import { ContactanosComponent } from './components/contactanos/contactanos.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'recuperar-password', component: RecuperarPasswordComponent },
  { path: 'contactanos', component: ContactanosComponent },

  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },

  { path: 'clientes', component: ClientesCreditoComponent },
  { path: 'proveedores', component: ProveedoresComponent },

  {
    path: 'nuevaventa',
    component: NuevaventaComponent,
    canActivate: [AuthGuard],
    canDeactivate: [CanDeactivateGuard],
    data: { roles: ['CAJERO', 'ADMIN'] },
  },

  {
    path: 'verventa/:id',
    component: VerventaComponent,
    canActivate: [AuthGuard],
    data: { roles: ['CAJERO', 'ADMIN'] }, // cajero ve si es suya, admin ve todas
  },

  {
    path: 'ventas',
    component: VentasComponent,
    canActivate: [AuthGuard],
    data: { roles: ['CAJERO', 'ADMIN'] }, //cajero solo ve las suyas, admin ve todas
  },

  {
    path: 'stats',
    component: StatsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] },
  },

  {
    path: 'proveedor/:id',
    component: ProveedorPerfilComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'CAJERO'] },
  },

  {
    path: 'cliente/:id',
    component: ClientePerfilComponent,
    canActivate: [AuthGuard],
    data: { roles: ['CAJERO', 'ADMIN'] },
  },
  {
    path: 'productos',
    component: ProductosComponent,
    canActivate: [AuthGuard],
    data: { roles: ['CAJERO', 'ADMIN'] },
  },
  {
    path: 'ofertas',
    component: OfertasComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'CAJERO'] },
  },

  {
    path: 'producto/:id',
    component: ProductoInfoComponent,
    canActivate: [AuthGuard],
    data: { roles: ['CAJERO', 'ADMIN'] },
  },

  {
    path: 'perfil',
    component: PerfilComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'CAJERO'] },
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
