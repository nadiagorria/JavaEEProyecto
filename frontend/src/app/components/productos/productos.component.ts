import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ProductoService } from '../../../services/producto.service';
import { CategoriaService } from '../../../services/categoria.service';
import { UrlService } from '../../../services/url.service';
import { SecurityService } from '../../../services/security.service';
import { ProductoDto } from 'src/models/producto.dto';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    HeaderComponent
  ],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.scss'
})
export class ProductosComponent implements OnInit, OnDestroy {
  constructor(
      private productoService: ProductoService,
      private categoriaService: CategoriaService,
      private urlService: UrlService,
      private router: Router,
      private route: ActivatedRoute,
      private securityService: SecurityService
    ) { }

  productos: ProductoDto[] = [];
  categorias: any[] = [];  ngOnInit() {
    this.cargarProductos();
    this.cargarCategorias();
  }
  ngOnDestroy() {
    // Limpiar las URLs de objeto para evitar memory leaks
    this.limpiarCacheImagenes();
  }

  // Método para limpiar el cache de imágenes y liberar memoria
  private limpiarCacheImagenes() {
    this.imagenesProductoCache.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    this.imagenesProductoCache.clear();
  }cargarCategorias() {
    this.categoriaService.listarCategorias().subscribe({
      next: (response) => {
        // Asegurarnos que todas las categorías tienen IDs numéricos
        this.categorias = response.categorias.map(cat => {
          // Si el ID no es número, intentar convertirlo
          if (cat.id !== null && typeof cat.id !== 'number') {
            const numId = Number(cat.id);
            if (!isNaN(numId)) {
              cat.id = numId;
            }
          }
          return cat;
        });
        
        console.log('=== DEBUG CATEGORIAS CARGADAS ===');
        console.log('Categorías completas:', this.categorias);
        
        // Verificar cada categoría
        this.categorias.forEach((cat, index) => {
          console.log(`Categoría ${index}:`, {
            id: cat.id,
            nombre: cat.nombre,
            tipoId: typeof cat.id,
            tipoNombre: typeof cat.nombre
          });
        });
        console.log('================================');
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
        // Cargar imágenes solo cuando se cargan los productos por primera vez
        this.cargarImagenesProductos();
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
      }
    });
  }  // Método para cargar las imágenes una sola vez y cachearlas
  cargarImagenesProductos() {
    this.productos.forEach(producto => {
      if (producto.id !== null && producto.id !== undefined && !this.imagenesProductoCache.has(producto.id)) {
        // Cargar la imagen como blob y crear una URL objeto
        this.productoService.obtenerImagenProducto(producto.id).subscribe({
          next: (blob) => {
            if (blob && blob.size > 0) {
              const urlImagen = URL.createObjectURL(blob);
              this.imagenesProductoCache.set(producto.id!, urlImagen);
            } else {
              // Si no hay imagen o está vacía, usar placeholder
              this.imagenesProductoCache.set(producto.id!, '/placeholder-image.webp');
            }
            
          },
          error: (error) => {            console.error(`Error al cargar imagen del producto ${producto.id}:`, error);
            // En caso de error (404, etc.), usar placeholder
            this.imagenesProductoCache.set(producto.id!, '/placeholder-image.webp');
          }
        });
      }
    });
  }
  verProducto(id: number | null) {
    if (id !== null) {
      this.router.navigate(['/producto', id]);
    }
  }

  // Modales
  mostrarModalAgregarCategoria: boolean = false;
  mostrarModalEliminarCategoria: boolean = false;
  mostrarModalAgregarProducto: boolean = false;

  // Formulario agregar categoría
  nombreCategoria: string = '';
  categoriaPadre: number | null = null;

  // Formulario eliminar categoría
  categoriaSeleccionada: number | null = null;  // Formulario agregar producto
  nuevoProducto = {
    nombre: '',
    precio: 0,
    precioCompra: 0,
    codigoDeBarra: '',
    stockMin: 0,
    stockTotal: 0,
    categoriaId: null as number | null,
    proveedorId: null as number | null
  };  // Variables para manejo de imagen
  imagenSeleccionada: File | null = null;
  imagenPreview: string | null = null;
  
  // Variables para mensajes de feedback
  mensajeError: string = '';
  mensajeExito: string = '';
  
  // Cache de URLs de imágenes para evitar recargas automáticas
  imagenesProductoCache: Map<number, string> = new Map();

  abrirModal(tipo: string) {
    if (tipo === 'categoria') this.mostrarModalAgregarCategoria = true;
    if (tipo === 'eliminar') this.mostrarModalEliminarCategoria = true;
    if (tipo === 'producto') this.mostrarModalAgregarProducto = true;
  }
  
  crearCategoria() {
    if (!this.nombreCategoria) return;

    const nuevaCategoria = {
      id: null,
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
  }  onImagenSeleccionada(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imagenSeleccionada = file;
      
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagenPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }  crearProducto() {
    // Limpiar mensajes anteriores
    this.mensajeError = '';
    this.mensajeExito = '';
    
    // Validar formulario
    const validacion = this.validarFormularioProducto();
    if (!validacion.valido) {
      this.mensajeError = validacion.mensaje;
      return;
    }

    // Debug: Mostrar información sobre la categoría seleccionada
    console.log('=== DEBUG CATEGORIA ===');
    console.log('Categoria ID seleccionada:', this.nuevoProducto.categoriaId);
    console.log('Tipo de categoria ID:', typeof this.nuevoProducto.categoriaId);
    console.log('Categorías disponibles:', this.categorias);
    console.log('======================');
      // Verificar autenticación y rol usando el servicio de seguridad
    const token = localStorage.getItem('token');
    
    if (!token) {
      this.mensajeError = 'No se encuentra autenticado. Por favor, inicie sesión nuevamente.';
      return;
    }
    
    // Verificar si el usuario está logueado y obtener sus roles
    if (!this.securityService.isLoggedIn()) {
      this.mensajeError = 'No se encuentra autenticado. Por favor, inicie sesión nuevamente.';
      return;
    }
    
    const userRoles = this.securityService.getUserRoles();
    const isAdmin = userRoles && userRoles.includes('ADMIN');
    
    if (!isAdmin) {
      this.mensajeError = 'No tiene permisos para crear productos. Se requiere rol de administrador.';
      return;
    }    // Verificar que categoriaId no sea null antes de enviar
    if (this.nuevoProducto.categoriaId === null || this.nuevoProducto.categoriaId === undefined) {
      this.mensajeError = 'Error: Debe seleccionar una categoría';
      return;
    }

    // Verificar que sea un número
    if (typeof this.nuevoProducto.categoriaId !== 'number') {
      console.error('Error: ID de categoría no es un número:', this.nuevoProducto.categoriaId);
      this.mensajeError = 'Error: ID de categoría inválido (no es un número)';
      return;
    }

    // Asegurar que la categoría exista
    const categoriaExiste = this.categorias.some(c => c.id === this.nuevoProducto.categoriaId);
    if (!categoriaExiste) {
      this.mensajeError = 'Error: La categoría seleccionada no es válida';
      return;
    }

    // La categoría ID ya es un número, simplemente lo usamos
    const categoriaId = this.nuevoProducto.categoriaId;    // Crear FormData para enviar datos con imagen
    const formData = new FormData();
    formData.append('nombre', this.nuevoProducto.nombre.trim());
    formData.append('precioVenta', this.nuevoProducto.precio.toString());
    formData.append('precioCompra', this.nuevoProducto.precioCompra.toString());
    
    // Generar código de barras único si está vacío
    let codigoBarra = this.nuevoProducto.codigoDeBarra.trim();
    if (!codigoBarra) {
      // Generar un código de barras basado en timestamp y nombre
      const timestamp = Date.now();
      const nombreCorto = this.nuevoProducto.nombre.replace(/\s+/g, '').substring(0, 5).toUpperCase();
      codigoBarra = `${nombreCorto}${timestamp}`;
    }
    formData.append('codigoDeBarra', codigoBarra);
    
    formData.append('stockMin', this.nuevoProducto.stockMin.toString());
    formData.append('stockTotal', this.nuevoProducto.stockTotal.toString());
    
    // Asegurar que categoriaId sea enviado como número y convertido a string para FormData
    if (this.nuevoProducto.categoriaId !== null) {
      // Asegurarse de que sea un número antes de convertirlo a string
      const catId = Number(this.nuevoProducto.categoriaId);
      if (!isNaN(catId)) {
        formData.append('categoriaId', catId.toString());
        console.log('categoriaId añadido al FormData:', catId.toString());      } else {
        console.error('Error: categoriaId no es un número válido:', this.nuevoProducto.categoriaId);
        this.mensajeError = 'Error: ID de categoría inválido';
        return;
      }
    } else {
      console.error('Error: categoriaId es null');
      this.mensajeError = 'Error: Debe seleccionar una categoría';
      return;
    }
    
    // Manejar proveedorId si existe
    if (this.nuevoProducto.proveedorId !== null && this.nuevoProducto.proveedorId !== undefined) {
      const provId = Number(this.nuevoProducto.proveedorId);
      if (!isNaN(provId)) {
        formData.append('proveedorId', provId.toString());
        console.log('proveedorId añadido al FormData:', provId.toString());
      } else {
        console.error('Error: proveedorId no es un número válido:', this.nuevoProducto.proveedorId);
        // No bloqueamos la creación si el proveedor es inválido, simplemente no lo incluimos
      }
    }
    
    if (this.imagenSeleccionada) {
      formData.append('imagen', this.imagenSeleccionada);
      console.log('Imagen añadida al FormData');
    }    console.log('Intentando crear producto con imagen...');
    console.log('Token:', token ? 'Presente' : 'Ausente');
    console.log('Token completo:', token);
    console.log('Roles del usuario:', userRoles);
    console.log('Es Admin:', isAdmin);
    console.log('Usuario del servicio:', this.securityService.user);
    
    // Debug completo del FormData
    console.log('=== DEBUG FORMDATA ===');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value, `(tipo: ${typeof value})`);
    }
    console.log('======================');
    
    console.log('FormData enviado:', {
      nombre: this.nuevoProducto.nombre,
      precio: this.nuevoProducto.precio,
      categoriaId: this.nuevoProducto.categoriaId,
      imagen: this.imagenSeleccionada ? 'Archivo seleccionado' : 'Sin imagen'
    });
    // Debug del categoriaId final
    console.log('CategoriaId final:', this.nuevoProducto.categoriaId);
    console.log('CategoriaId es válido:', this.nuevoProducto.categoriaId !== null);
    
    this.productoService.crearProductoConImagen(formData).subscribe({      next: (response) => {
        console.log('Producto creado exitosamente:', response);
        // Limpiar formulario
        this.resetearFormularioProducto();
        this.mostrarModalAgregarProducto = false;        // Actualizar lista de productos
        this.cargarProductos();
        // Limpiar el cache de imágenes para forzar la recarga de las nuevas imágenes
        this.limpiarCacheImagenes();
        this.mensajeExito = 'Producto creado exitosamente';
      },error: (error) => {
        console.error('Error al crear producto:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Error object:', error.error);
        console.error('Error type:', typeof error.error);
        
        let mensajeError = 'Error al crear el producto';
        
        // Mejorar la detección del tipo de error y extracción del mensaje
        if (error.error instanceof Object) {
          // Si es un objeto JSON
          mensajeError = error.error.message || mensajeError;
        } else if (typeof error.error === 'string') {
          // Si es un string (texto plano)
          mensajeError = error.error;
        } else if (error.status === 0) {
          mensajeError = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
        } else if (error.statusText) {
          mensajeError = error.statusText;
        }
          if (error.status === 403) {
          this.mensajeError = 'Error de autorización. Por favor, verifique que esté logueado correctamente.';
        } else if (error.status === 400) {
          this.mensajeError = `Datos inválidos. ${mensajeError}`;
        } else {
          this.mensajeError = mensajeError;
        }
      }
    });
  }  // Método para obtener la URL de la imagen de un producto desde el cache
  obtenerImagenProducto(id: number | null): string {
    if (id === null || id === undefined) {
      return '/placeholder-image.webp';
    }
    return this.imagenesProductoCache.get(id) || '/placeholder-image.webp';
  }
  private getBaseUrl(): string {
    return this.urlService.baseUrl;
  }  onImageError(event: any) {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement && !imgElement.src.includes('placeholder-image.webp')) {
      imgElement.src = '/placeholder-image.webp';
    }
  }// Método para resetear el formulario de producto
  resetearFormularioProducto() {
    this.nuevoProducto = {
      nombre: '',
      precio: 0,
      precioCompra: 0,
      codigoDeBarra: '',
      stockMin: 0,
      stockTotal: 0,
      categoriaId: null, // Usar null para consistencia
      proveedorId: null
    };
    this.imagenSeleccionada = null;
    this.imagenPreview = null;
    this.mensajeError = '';
    this.mensajeExito = '';
    
    console.log('Formulario reseteado. CategoriaId:', this.nuevoProducto.categoriaId);
  }

  // Método para abrir el modal de agregar producto
  abrirModalAgregarProducto() {
    this.resetearFormularioProducto();
    this.mostrarModalAgregarProducto = true;
  }  // Método para validar el formulario de producto
  validarFormularioProducto(): { valido: boolean, mensaje: string } {
    if (!this.nuevoProducto.nombre.trim()) {
      return { valido: false, mensaje: 'Por favor ingrese el nombre del producto' };
    }
    if (this.nuevoProducto.precio <= 0) {
      return { valido: false, mensaje: 'El precio de venta debe ser mayor a 0' };
    }    
    if (this.nuevoProducto.precioCompra < 0) {
      return { valido: false, mensaje: 'El precio de compra no puede ser negativo' };
    }
      // Validación del código de barras - debe existir
    if (!this.nuevoProducto.codigoDeBarra.trim()) {
      return { valido: false, mensaje: 'Por favor ingrese el código de barras del producto' };
    }
    
    // Validación de stock mínimo - es obligatorio
    if (this.nuevoProducto.stockMin === null || this.nuevoProducto.stockMin === undefined || this.nuevoProducto.stockMin < 0) {
      return { valido: false, mensaje: 'Por favor ingrese un stock mínimo válido (mayor o igual a 0)' };
    }
    
    // Validación de stock total - es obligatorio
    if (this.nuevoProducto.stockTotal === null || this.nuevoProducto.stockTotal === undefined || this.nuevoProducto.stockTotal < 0) {
      return { valido: false, mensaje: 'Por favor ingrese un stock total válido (mayor o igual a 0)' };
    }
    
    // Validación mejorada de la categoría
    console.log('Validando categoría en formulario:', this.nuevoProducto.categoriaId, 'tipo:', typeof this.nuevoProducto.categoriaId);
    
    // Verificar si la categoría está seleccionada
    if (this.nuevoProducto.categoriaId === null || this.nuevoProducto.categoriaId === undefined) {
      console.error('Error: categoriaId es null o undefined:', this.nuevoProducto.categoriaId);
      return { valido: false, mensaje: 'Por favor seleccione una categoría' };
    }
    
    // Verificar que sea un número válido
    if (typeof this.nuevoProducto.categoriaId !== 'number') {
      console.error('Error: categoriaId no es un número:', this.nuevoProducto.categoriaId);
      return { valido: false, mensaje: 'ID de categoría inválido (no es un número)' };
    }
      // Verificar si la categoría existe en la lista de categorías
    const categoriaExiste = this.categorias.some(c => c.id === this.nuevoProducto.categoriaId);
    if (!categoriaExiste) {
      console.error('Categoría seleccionada no encontrada en la lista de categorías');
      return { valido: false, mensaje: 'La categoría seleccionada no es válida' };
    }
    if (this.nuevoProducto.stockMin < 0 || this.nuevoProducto.stockTotal < 0) {
      return { valido: false, mensaje: 'Los valores de stock no pueden ser negativos' };
    }
    if (this.nuevoProducto.stockTotal < this.nuevoProducto.stockMin) {
      return { valido: false, mensaje: 'El stock total no puede ser menor al stock mínimo' };
    }
    return { valido: true, mensaje: '' };
  }  // Método para obtener el nombre de una categoría por su ID
  obtenerNombreCategoria(categoriaId: number | null): string {
    if (categoriaId === null || categoriaId === undefined) {
      return '';
    }
    
    const categoria = this.categorias.find(cat => cat.id === categoriaId);
    return categoria ? categoria.nombre : '';
  }  // Método para validar que el categoriaId sea un número
  validarCategoriaId(valor: any): void {
    if (valor !== null && valor !== undefined) {
      // Si ya es un número, mantenlo así
      if (typeof valor === 'number') {
        this.nuevoProducto.categoriaId = valor;
      } else {
        // Intenta convertir a número solo si es string
        const numeroConvertido = Number(valor);
        this.nuevoProducto.categoriaId = isNaN(numeroConvertido) ? null : numeroConvertido;
      }
    } else {
      this.nuevoProducto.categoriaId = null;
    }  }

  // Para depuración en consola (accesible desde la plantilla)
  console = console;
}
