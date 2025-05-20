import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    DropdownModule,
    InputTextModule
  ],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.scss'
})
export class ProductosComponent {
  productos: any[] = [
    { nombre: 'Producto 1', precio: 10 },
    { nombre: 'Producto 2', precio: 20 }
  ];
  categorias: any[] = [
    { id: 1, nombre: 'Electrónica' },
    { id: 2, nombre: 'Ropa' }
  ];

  // Modales
  mostrarModalAgregarCategoria: boolean = false;
  mostrarModalEliminarCategoria: boolean = false;
  mostrarModalAgregarProducto: boolean = false;

  // Formulario agregar categoría
  nombreCategoria: string = '';
  categoriaPadre: number | null = null;

  // Formulario eliminar categoría
  categoriaSeleccionada: number | null = null;

  // Formulario agregar producto
  nuevoProducto = {
    nombre: '',
    precio: 0,
    categoriaId: null
  };

  abrirModal(tipo: string) {
    if (tipo === 'categoria') this.mostrarModalAgregarCategoria = true;
    if (tipo === 'eliminar') this.mostrarModalEliminarCategoria = true;
    if (tipo === 'producto') this.mostrarModalAgregarProducto = true;
  }

  crearCategoria() {
    if (!this.nombreCategoria) return;
    const nueva = {
      id: this.categorias.length + 1,
      nombre: this.nombreCategoria,
      padre: this.categoriaPadre
    };
    this.categorias.push(nueva);
    this.nombreCategoria = '';
    this.categoriaPadre = null;
    this.mostrarModalAgregarCategoria = false;
  }

  eliminarCategoria() {
    if (this.categoriaSeleccionada == null) return;
    this.categorias = this.categorias.filter(c => c.id !== this.categoriaSeleccionada);
    this.categoriaSeleccionada = null;
    this.mostrarModalEliminarCategoria = false;
  }

  crearProducto() {
    const nuevo = {
      nombre: this.nuevoProducto.nombre,
      precio: this.nuevoProducto.precio
    };
    this.productos.push(nuevo);
    this.nuevoProducto = { nombre: '', precio: 0, categoriaId: null };
    this.mostrarModalAgregarProducto = false;
  }
}
