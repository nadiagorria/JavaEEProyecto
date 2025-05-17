import { Routes } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { StatsComponent } from './stats/stats.component';
import { ClientePerfilComponent } from './cliente-perfil/cliente-perfil.component';


export const routes: Routes = [
  { path: 'header', component: HeaderComponent },
  { path: 'home', component: HomeComponent },
  { path: 'footer', component: FooterComponent },
  { path: 'stats', component: StatsComponent },
  { path: 'cliente', component: ClientePerfilComponent }

];
