import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AgregarCategoriaComponent } from './agregar-categoria/agregar-categoria.component';
import { EliminarCategoriaComponent } from './eliminar-categoria/eliminar-categoria.component';
import { PerfilComponent } from './perfil/perfil.component';
import { ProductosComponent } from './productos/productos.component';
import { ProductoInfoComponent } from './producto-info/producto-info.component';

@Component({
  selector: 'app-root',
  standalone: true, // ✅ componente standalone
  imports: [RouterOutlet, AgregarCategoriaComponent, EliminarCategoriaComponent, PerfilComponent, ProductosComponent, ProductoInfoComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend';
}

