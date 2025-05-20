import { Routes } from '@angular/router';
import { AgregarCategoriaComponent } from './agregar-categoria/agregar-categoria.component';
import { EliminarCategoriaComponent } from './eliminar-categoria/eliminar-categoria.component';
import { PerfilComponent } from './perfil/perfil.component';
import { ProductosComponent } from './productos/productos.component';
import { ProductoInfoComponent } from './producto-info/producto-info.component';

export const routes: Routes = [
    { path: 'agregar_categoria', component: AgregarCategoriaComponent },
    { path: 'eliminar_categoria', component: EliminarCategoriaComponent },
    { path: 'productos', component: ProductosComponent },
    { path: 'perfil', component: PerfilComponent },
    { path: 'producto_info', component: ProductoInfoComponent },
  ];
