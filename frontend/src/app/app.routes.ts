// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { ButtonDemo } from './button-demo.component'; // Ajusta si está en una subcarpeta

export const routes: Routes = [
  { path: '', component: ButtonDemo }, // muestra por defecto
  { path: 'button-demo', component: ButtonDemo } // ruta explícita
];
