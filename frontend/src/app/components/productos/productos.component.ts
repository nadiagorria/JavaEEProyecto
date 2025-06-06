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
import { EntidadService } from '../../../services/entidad.service';
import { UrlService } from '../../../services/url.service';
import { SecurityService } from '../../../services/security.service';
import { ProductoDto } from 'src/models/producto.dto';
import { ProveedorDto } from 'src/models/proveedor.dto';
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
      private entidadService: EntidadService,
      private urlService: UrlService,
      private router: Router,
      private route: ActivatedRoute,
      private securityService: SecurityService
    ) { }

  productos: ProductoDto[] = [];
  categorias: any[] = [];
  proveedores: ProveedorDto[] = [];

  ngOnInit() {
    this.cargarProductos();
    this.cargarCategorias();
    this.cargarProveedores();
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
  }

  cargarCategorias() {
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
  cargarProveedores() {
    this.entidadService.listadoProveedores().subscribe({
      next: (response: {proveedores: ProveedorDto[]}) => {
        this.proveedores = response.proveedores;
        console.log('=== DEBUG PROVEEDORES CARGADOS ===');
        console.log('Proveedores:', this.proveedores);
      },
      error: (error: any) => {
        console.error('Error al cargar proveedores:', error);
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
  }

  // Método para cargar las imágenes una sola vez y cachearlas
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
          error: (error) => {
            console.error(`Error al cargar imagen del producto ${producto.id}:`, error);
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
  categoriaSeleccionada: number | null = null;

  // Formulario agregar producto
  nuevoProducto = {
    nombre: '',
    precio: 0,
    precioCompra: 0,
    codigoDeBarra: '',
    stockMin: 0,
    stockTotal: 0,
    categoriaId: null as number | null,
    proveedorId: null as number | null
  };

  // Variables para manejo de imagen
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
    };

    this.categoriaService.crearCategoria(nuevaCategoria).subscribe({
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

  onImagenSeleccionada(event: any) {
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
  }

  crearProducto() {
    // Limpiar mensajes anteriores
    this.mensajeError = '';
    this.mensajeExito = '';
    
    // Validar formulario
    const validacion = this.validarFormularioProducto();
    if (!validacion.valido) {
      this.mensajeError = validacion.mensaje;
      return;
    }

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
    }

    // Verificar que categoriaId no sea null
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

    // Generar código de barras único si está vacío
    let codigoBarra = this.nuevoProducto.codigoDeBarra.trim();
    if (!codigoBarra) {
      const timestamp = Date.now();
      const nombreCorto = this.nuevoProducto.nombre.replace(/\s+/g, '').substring(0, 5).toUpperCase();
      codigoBarra = `${nombreCorto}${timestamp}`;
    }    // Convertir imagen a base64 si existe
    this.convertirImagenABase64().then((imagenBase64) => {
      // Buscar la categoría completa
      const categoriaSeleccionada = this.categorias.find(c => c.id === this.nuevoProducto.categoriaId);
      
      // Buscar el proveedor completo si se seleccionó uno
      const proveedorSeleccionado = this.nuevoProducto.proveedorId 
        ? this.proveedores.find(p => p.id === this.nuevoProducto.proveedorId) 
        : null;
        // Crear el ProductoDto completo
      const productoDto: ProductoDto = {
        id: null,
        nombre: this.nuevoProducto.nombre.trim(),
        precioCompra: 0, // Automáticamente establecido en 0
        precioVenta: this.nuevoProducto.precio,
        codigoDeBarra: codigoBarra,
        stockMin: this.nuevoProducto.stockMin,
        stockTotal: 0, // Automáticamente establecido en 0
        imagen: imagenBase64,
        activo: true,
        categoria: categoriaSeleccionada ? { id: categoriaSeleccionada.id, nombre: categoriaSeleccionada.nombre } : null,
        proveedor: proveedorSeleccionado ? { id: proveedorSeleccionado.id, nombre: proveedorSeleccionado.nombre } : null,
        lotes: [],
        cantidades: [],
        promociones: [],
        combos: [],
        descuentos: []
      };

      console.log('Enviando ProductoDto:', productoDto);

      // Enviar el DTO al backend
      this.productoService.crearProductoConDto(productoDto).subscribe({
        next: (response) => {
          console.log('Producto creado exitosamente:', response);
          // Limpiar formulario
          this.resetearFormularioProducto();
          this.mostrarModalAgregarProducto = false;
          // Actualizar lista de productos
          this.cargarProductos();
          // Limpiar el cache de imágenes para forzar la recarga
          this.limpiarCacheImagenes();
          this.mensajeExito = 'Producto creado exitosamente';
        },
        error: (error) => {
          console.error('Error al crear producto:', error);
          
          let mensajeError = 'Error al crear el producto';
          
          if (error.error instanceof Object) {
            mensajeError = error.error.message || mensajeError;
          } else if (typeof error.error === 'string') {
            mensajeError = error.error;
          } else if (error.message) {
            mensajeError = error.message;
          }
          
          this.mensajeError = mensajeError;
        }
      });
    }).catch((error) => {
      console.error('Error al convertir imagen:', error);
      this.mensajeError = 'Error al procesar la imagen';
    });
  }

  // Método para obtener la URL de la imagen de un producto desde el cache
  obtenerImagenProducto(id: number | null): string {
    if (id === null || id === undefined) {
      return '/placeholder-image.webp';
    }
    return this.imagenesProductoCache.get(id) || '/placeholder-image.webp';
  }

  private getBaseUrl(): string {
    return this.urlService.baseUrl;
  }

  onImageError(event: any) {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement && !imgElement.src.includes('placeholder-image.webp')) {
      imgElement.src = '/placeholder-image.webp';
    }
  }

  // Método para resetear el formulario de producto
  resetearFormularioProducto() {
    this.nuevoProducto = {
      nombre: '',
      precio: 0,
      precioCompra: 0, // Siempre 0 al crear productos
      codigoDeBarra: '',
      stockMin: 0,
      stockTotal: 0, // Siempre 0 al crear productos
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
  }
  // Método para validar el formulario de producto
  validarFormularioProducto(): { valido: boolean, mensaje: string } {
    if (!this.nuevoProducto.nombre.trim()) {
      return { valido: false, mensaje: 'Por favor ingrese el nombre del producto' };
    }
    if (this.nuevoProducto.precio <= 0) {
      return { valido: false, mensaje: 'El precio de venta debe ser mayor a 0' };
    }
    // Validación del código de barras - debe existir
    if (!this.nuevoProducto.codigoDeBarra.trim()) {
      return { valido: false, mensaje: 'Por favor ingrese el código de barras del producto' };
    }
    
    // Validación de stock mínimo - es obligatorio
    if (this.nuevoProducto.stockMin === null || this.nuevoProducto.stockMin === undefined || this.nuevoProducto.stockMin < 0) {
      return { valido: false, mensaje: 'Por favor ingrese un stock mínimo válido (mayor o igual a 0)' };
    }
    
    // Validación específica de categoría
    console.log('Validando categoría en formulario:', this.nuevoProducto.categoriaId, 'tipo:', typeof this.nuevoProducto.categoriaId);
    
    // La categoría es obligatoria
    if (this.nuevoProducto.categoriaId === null || this.nuevoProducto.categoriaId === undefined) {
      console.error('Error: categoriaId es null o undefined:', this.nuevoProducto.categoriaId);
      return { valido: false, mensaje: 'Por favor seleccione una categoría' };
    }
    
    // Verificar que sea un número
    if (typeof this.nuevoProducto.categoriaId !== 'number') {
      console.error('Error: categoriaId no es un número:', this.nuevoProducto.categoriaId);
      return { valido: false, mensaje: 'ID de categoría inválido (no es un número)' };
    }
    
    // Verificar que la categoría exista en la lista
    const categoriaExiste = this.categorias.some(c => c.id === this.nuevoProducto.categoriaId);
    if (!categoriaExiste) {
      return { valido: false, mensaje: 'La categoría seleccionada no es válida' };
    }
    
    return { valido: true, mensaje: '' };
  }
  // Método para obtener el nombre de la categoría por ID
  obtenerNombreCategoria(categoriaId: number | null): string {
    if (categoriaId === null || categoriaId === undefined) {
      return '';
    }
    const categoria = this.categorias.find(cat => cat.id === categoriaId);
    return categoria ? categoria.nombre : '';
  }

  // Método para obtener el nombre del proveedor por ID
  obtenerNombreProveedor(proveedorId: number | null): string {
    if (proveedorId === null || proveedorId === undefined) {
      return '';
    }
    const proveedor = this.proveedores.find(prov => prov.id === proveedorId);
    return proveedor ? proveedor.nombre : '';
  }

  // Método para validar y convertir el ID de categoría
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
    }
  }

  // Para depuración en consola (accesible desde la plantilla)
  console = console;

  // Método helper para convertir imagen a base64
  private convertirImagenABase64(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      if (!this.imagenSeleccionada) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Extraer solo la parte base64 (sin el prefijo "data:image/...")
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject('Error al leer la imagen');
        }
      };
      reader.onerror = () => reject('Error al leer la imagen');
      reader.readAsDataURL(this.imagenSeleccionada);
    });
  }
}
