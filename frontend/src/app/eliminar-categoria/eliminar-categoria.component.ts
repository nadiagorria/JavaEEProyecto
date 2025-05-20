import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-eliminar-categoria',
  standalone: true, // 👈 Componente standalone
  imports: [FormsModule], // 👈 Importa FormsModule para usar ngModel
  templateUrl: './eliminar-categoria.component.html',
  styleUrls: ['./eliminar-categoria.component.scss']
})
export class EliminarCategoriaComponent {
  categoriaSeleccionada: string = '';
  categorias: { id: string; nombre: string }[] = []; // Array de categorías

  ngOnInit(): void {
    // Simulación de datos iniciales
    this.categorias = [
      { id: '1', nombre: 'Electrónica' },
      { id: '2', nombre: 'Ropa' },
      { id: '3', nombre: 'Hogar' }
    ];
  }


  eliminarCategoria() {
    if (!this.categoriaSeleccionada) {
      alert('Por favor selecciona una categoría para eliminar.');
      return;
    }

    const categoria = this.categorias.find(cat => cat.id === this.categoriaSeleccionada);

    if (categoria) {
      console.log('Categoría eliminada:', categoria);
      alert(`Categoría "${categoria.nombre}" eliminada correctamente.`);

      // Remover la categoría del arreglo
      this.categorias = this.categorias.filter(cat => cat.id !== this.categoriaSeleccionada);
      this.categoriaSeleccionada = ''; // Resetear selección
    }
  }
}
