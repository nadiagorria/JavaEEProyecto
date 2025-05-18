import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { NuevaventaComponent } from './components/nuevaventa/nuevaventa.component';
import { VerventaComponent } from './components/verventa/verventa.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'nuevaventa', component: NuevaventaComponent },
  { path: 'verventa', component: VerventaComponent },

];
