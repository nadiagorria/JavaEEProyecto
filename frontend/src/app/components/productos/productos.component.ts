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
  categorias: any[] = [];

  ngOnInit() {
    this.cargarProductos();
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.categoriaService.listarCategorias().subscribe({
      next: (response) => {
        this.categorias = response.categorias;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
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
    };    this.categoriaService.crearCategoria(nuevaCategoria).subscribe({
      next: (response) => {
        console.log('Categoría creada exitosamente:', response);
        // Primero cerramos el modal y limpiamos el formulario
        this.nombreCategoria = '';
        this.categoriaPadre = null;
        this.mostrarModalAgregarCategoria = false;
        
        // Luego actualizamos la lista de categorías
        this.categoriaService.listarCategorias().subscribe({
          next: (response) => {
            console.log('Categorías actualizadas:', response);
            this.categorias = response.categorias;
          },
          error: (error) => {
            console.error('Error al listar categorías:', error);
          }
        });
      },
      error: (error) => {
        console.error('Error al crear categoría:', error);
        // Cerramos el modal y limpiamos aunque haya error
        this.nombreCategoria = '';
        this.categoriaPadre = null;
        this.mostrarModalAgregarCategoria = false;
        alert('Error al crear la categoría');
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
    if (!this.nuevoProducto.nombre) {
      alert('Por favor ingrese el nombre del producto');
      return;
    }
    if (this.nuevoProducto.precio <= 0) {
      alert('El precio debe ser mayor a 0');
      return;
    }
    if (this.nuevoProducto.categoriaId == null) {
      alert('Por favor seleccione una categoría');
      return;
    }

    const nuevo: ProductoDto = {
      id: 0,
      nombre: this.nuevoProducto.nombre,
      precioVenta: this.nuevoProducto.precio,
      precioCompra: 0,
      codigoDeBarra: '',
      stockMin: 0,
      stockTotal: 0,
      imagen: '',
      promociones: [],
      combos: [],
      descuentos: [],
      categoria: { id: this.nuevoProducto.categoriaId, nombre: '' },
      proveedor: { id: 0, nombre: '' },
      lotes: [],
      cantidades: [],
      activo: true
    };

    console.log('Intentando crear producto:', nuevo);
    this.productoService.crearProducto(nuevo).subscribe({
      next: (response) => {
        console.log('Producto creado exitosamente:', response);
        // Primero cerramos el modal y limpiamos el formulario
        this.nuevoProducto = { nombre: '', precio: 0, categoriaId: null };
        this.mostrarModalAgregarProducto = false;
        // Luego actualizamos la lista de productos
        this.cargarProductos();
      },
      error: (error) => {
        console.error('Error al crear producto:', error);
        alert('Error al crear el producto');
      }
    });
  }
}
