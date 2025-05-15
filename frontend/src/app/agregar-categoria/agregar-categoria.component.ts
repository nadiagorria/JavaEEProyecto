import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-agregar-categoria',
  standalone: true, // 👈 muy importante
  imports: [FormsModule], // 👈 aquí importamos FormsModule
  templateUrl: './agregar-categoria.component.html',
  styleUrls: ['./agregar-categoria.component.scss']
})
export class AgregarCategoriaComponent {
  nombreCategoria: string = '';
  categoriaPadre: string = '';
  categorias: { id: string; nombre: string }[] = []; // Array de categorías

  ngOnInit(): void {
    // Simulación de datos iniciales
    this.categorias = [
      { id: '1', nombre: 'Electrónica' },
      { id: '2', nombre: 'Ropa' },
      { id: '3', nombre: 'Hogar' }
    ];
  }

  crearCategoria() {
    if (!this.nombreCategoria) {
      alert('Por favor ingresa un nombre de categoría.');
      return;
    }

    const nuevaCategoria = {
      nombre: this.nombreCategoria,
      categoriaPadre: this.categoriaPadre || null
    };

    console.log('Nueva categoría creada:', nuevaCategoria);
    alert('¡Categoría creada correctamente!');
    // Aquí podrías hacer una petición al backend con HttpClient

    // Limpiar el formulario
    this.nombreCategoria = '';
    this.categoriaPadre = '';
  }
}
