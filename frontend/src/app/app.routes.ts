import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { NuevaventaComponent } from './components/nuevaventa/nuevaventa.component';
import { VerventaComponent } from './components/verventa/verventa.component';
import { VentasComponent } from './components/ventas/ventas.component';
import { ClientePerfilComponent } from './components/cliente-perfil/cliente-perfil.component';
import { ProductosComponent } from './components/productos/productos.component';
import { ProductoInfoComponent } from './components/producto-info/producto-info.component';
import { HomeComponent } from './components/home/home.component';
import { StatsComponent } from './components/stats/stats.component';
import { AuthGuard } from 'src/guards/auth.guard';
import { CanDeactivateGuard } from './guards/can-deactivate.guard';
import { PerfilComponent } from './components/perfil/perfil.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { 
    path: 'nuevaventa', 
    component: NuevaventaComponent,
    canDeactivate: [CanDeactivateGuard]
  },
  { path: 'verventa/:id', component: VerventaComponent },
  { path: 'ventas', component: VentasComponent },
  { path: 'home', component: HomeComponent },
  { path: 'stats', component: StatsComponent},
  { path: 'cliente/:id', component: ClientePerfilComponent},
  { path: 'productos', component: ProductosComponent },
  { path: 'producto/:id', component: ProductoInfoComponent },
  { path: 'perfil', component: PerfilComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN', 'CAJERO'] } },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
