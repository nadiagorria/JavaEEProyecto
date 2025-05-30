import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { NuevaventaComponent } from './components/nuevaventa/nuevaventa.component';
import { VerventaComponent } from './components/verventa/verventa.component';
import { VentasComponent } from './components/ventas/ventas.component';
import { ClientePerfilComponent } from './components/cliente-perfil/cliente-perfil.component';
import { HomeComponent } from './components/home/home.component';
import { StatsComponent } from './components/stats/stats.component';
import { ClientesCreditoComponent } from './components/clientes-credito/clientes-credito.component';
import { ProveedorPerfilComponent } from './components/proveedor-perfil/proveedor-perfil.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'nuevaventa', component: NuevaventaComponent },
  { path: 'verventa/:id', component: VerventaComponent },
  { path: 'ventas', component: VentasComponent },
  { path: 'home', component: HomeComponent },
  { path: 'stats', component: StatsComponent},
  { path: 'cliente/:id', component: ClientePerfilComponent},
  { path: 'proveedor/:id', component: ProveedorPerfilComponent},
  { path: 'credito', component: ClientesCreditoComponent},
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
