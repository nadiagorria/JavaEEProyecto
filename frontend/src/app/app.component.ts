import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AgregarCategoriaComponent } from './agregar-categoria/agregar-categoria.component';
import { EliminarCategoriaComponent } from './eliminar-categoria/eliminar-categoria.component';
import { PerfilComponent } from './perfil/perfil.component';

@Component({
  selector: 'app-root',
  standalone: true, // ✅ componente standalone
  imports: [RouterOutlet, AgregarCategoriaComponent, EliminarCategoriaComponent, PerfilComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend';
}

