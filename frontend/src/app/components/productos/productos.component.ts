import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ProductoService } from '../../../services/producto.service';
import { CategoriaService } from '../../../services/categoria.service';
import { ProductoDto } from 'src/models/producto.dto';

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
export class ProductosComponent implements OnInit {


  constructor(
      private productoService: ProductoService,
      private categoriaService: CategoriaService,
      private router: Router,
      private route: ActivatedRoute
    ) { }

  productos: ProductoDto[] = [];

  categorias: any[] = [
    { id: 1, nombre: 'Electrónica' },
    { id: 2, nombre: 'Ropa' }
  ];

  ngOnInit() {
   this.cargarProductos();
  }

  cargarProductos() {
    this.productoService.listarProductos().subscribe({
      next: (response) => {
        this.productos = response.productos;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
      }
    });
  }

  verProducto(id: number) {
  this.router.navigate(['/producto', id]);
  }

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

    const nuevaCategoria = {
      id: 0, // El backend debe asignar el ID
      nombre: this.nombreCategoria,
      activo: true,
      subcategorias: [],
      categoriaPadre: this.categoriaPadre
        ? { id: this.categoriaPadre, nombre: '' }
        : null,
      productos: []
    };

    this.categoriaService.crearCategoria(nuevaCategoria).subscribe({
      next: () => {
        this.categoriaService.listarCategorias().subscribe({
          next: (response) => {
            this.categorias = response.categorias;
          }
        });
        this.nombreCategoria = '';
        this.categoriaPadre = null;
        this.mostrarModalAgregarCategoria = false;
      },
      error: (error) => {
        console.error('Error al crear categoría:', error);
      }
    });
  }

  eliminarCategoria() {
    if (this.categoriaSeleccionada == null) return;
    this.categoriaService.eliminarCategoria(this.categoriaSeleccionada).subscribe({
      next: () => {
        // Actualiza la lista de categorías tras eliminar
        this.categoriaService.listarCategorias().subscribe({
          next: (response) => {
            this.categorias = response.categorias;
          }
        });
        this.categoriaSeleccionada = null;
        this.mostrarModalEliminarCategoria = false;
      },
      error: (error) => {
        alert('Error al eliminar la categoría');
        console.error('Error al eliminar categoría:', error);
      }
    });
  }

  crearProducto() {
    if (this.nuevoProducto.categoriaId == null) {
      console.error('Debes seleccionar una categoría');
      return;
    }
    const nuevo: ProductoDto = {
      id: 0, // El backend lo ignora al crear
      nombre: this.nuevoProducto.nombre,
      precioVenta: this.nuevoProducto.precio,
      precioCompra: 0, // Ajusta si tienes este dato en el formulario
      codigoDeBarra: '', // Ajusta si tienes este dato en el formulario
      stockMin: 0,
      stockTotal: 0,
      imagen: '', // O una URL por defecto
      promociones: [],
      combos: [],
      descuentos: [],
      categoria: { id: this.nuevoProducto.categoriaId, nombre: '' },
      proveedor: { id: 0, nombre: '' }, // Ajusta si tienes proveedor en el formulario
      lotes: [],
      cantidades: [],
      activo: true
    };
    this.productoService.crearProducto(nuevo).subscribe({
      next: () => {
        this.cargarProductos();
        this.nuevoProducto = { nombre: '', precio: 0, categoriaId: null };
        this.mostrarModalAgregarProducto = false;
      },
      error: (error) => {
        console.error('Error al crear producto:', error);
      }
    });
  }
}
