// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HeaderComponent } from './components/header.component'; // Ajusta si está en una subcarpeta

export const routes: Routes = [
  { path: '', component: HeaderComponent }, // muestra por defecto
  { path: 'header', component: HeaderComponent } // ruta explícita
];
