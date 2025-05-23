import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { NuevaventaComponent } from './components/nuevaventa/nuevaventa.component';
import { VerventaComponent } from './components/verventa/verventa.component';
import { VentasComponent } from './components/ventas/ventas.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './components/home/home.component';
import { StatsComponent } from './components/stats/stats.component';
import { ClientePerfilComponent } from './components/cliente-perfil/cliente-perfil.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'nuevaventa', component: NuevaventaComponent },
  { path: 'verventa', component: VerventaComponent },
  { path: 'ventas', component: VentasComponent },
  { path: 'header', component: HeaderComponent },
  { path: 'home', component: HomeComponent },
  { path: 'footer', component: FooterComponent },
  { path: 'stats', component: StatsComponent },
  { path: 'cliente', component: ClientePerfilComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Add this line
  { path: '**', redirectTo: '/login' }
]

