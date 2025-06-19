import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ProductoService } from 'src/services/producto.service';
import { CategoriaService } from 'src/services/categoria.service';
import { CategoriaDto, ProductoDto, VentaDto} from 'src/models';
import { VentaService } from 'src/services/venta.service';
import { UsuarioService } from 'src/services/usuario.service';


@Component({
  selector: 'app-stats',
  imports: [HeaderComponent, FooterComponent, CommonModule, FormsModule],
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StatsComponent implements OnInit {

  ventasTotales: number = 0;
  usuariosTotales: number = 0;
  
  productosMasPopulares: ProductoDto[] = [];
  categoriasMasPopulares: CategoriaDto[] = [];
  ventas: VentaDto[] = [];
  ventasFiltradas: VentaDto[] = [];

  ganancias: number = 0;

  debito: number = 0;
  credito: number = 0;
  efectivo: number = 0;
  creditolocal: number = 0;

   // Filtros
  mesSeleccionado: string = '';
  anoSeleccionado: string = '';
  
  meses = [
    { valor: '', nombre: 'Todos los meses' },
    { valor: '1', nombre: 'Enero' },
    { valor: '2', nombre: 'Febrero' },
    { valor: '3', nombre: 'Marzo' },
    { valor: '4', nombre: 'Abril' },
    { valor: '5', nombre: 'Mayo' },
    { valor: '6', nombre: 'Junio' },
    { valor: '7', nombre: 'Julio' },
    { valor: '8', nombre: 'Agosto' },
    { valor: '9', nombre: 'Septiembre' },
    { valor: '10', nombre: 'Octubre' },
    { valor: '11', nombre: 'Noviembre' },
    { valor: '12', nombre: 'Diciembre' }
  ];

  anos: { valor: string, nombre: string }[] = [];
  
  n = 3; // de cuanto es el top N de productos que se quiere obtener

  constructor(
    private route: ActivatedRoute,
    private productoservice: ProductoService,
    private categoriaservice: CategoriaService,
    private ventaservice: VentaService,
    private usuarioservice: UsuarioService
  ) {
   
  }

  ngOnInit(): void {
    // Inicializar años disponibles (últimos 5 años + año actual)
    this.inicializarAnos();
    
    const currentYear = new Date().getFullYear().toString();
    
    // Cargar datos de totales
    this.ventaservice.getVentasTotales().subscribe(data => {
      this.ventasTotales = data;
      console.log('Ventas totales cargadas:', this.ventasTotales);
    });

    this.usuarioservice.getUsuariosTotales().subscribe(data => {
      this.usuariosTotales = data;
      console.log('Usuarios totales cargados:', this.usuariosTotales);
    });

    // Cargar productos populares y luego ventas
    this.productoservice.buscarTopNProductos(this.n).subscribe(
      data => {
        console.log('Respuesta completa de productos:', data);
        this.productosMasPopulares = data.productos || [];
        console.log('Productos más populares:', this.productosMasPopulares);
      },
      error => {
        console.error('Error al cargar productos populares:', error);
      }
    );    
    
    // Cargar categorías populares directamente del endpoint
    this.categoriaservice.listarTopCategorias(this.n).subscribe(
      data => {
        console.log('Respuesta completa de categorías:', data);
        this.categoriasMasPopulares = data.categorias || [];
        console.log('Categorías más populares:', this.categoriasMasPopulares);
        
        // Cargar ventas después de categorías
        this.cargarVentas();
      },
      error => {
        console.error('Error al cargar categorías populares:', error);
        // Cargar ventas incluso si falla la carga de categorías
        this.cargarVentas();
      }
    );
  }

  // Inicializar años disponibles
  inicializarAnos(): void {
    const currentYear = new Date().getFullYear();
    this.anos = [{ valor: '', nombre: 'Todos los años' }];
    
    // Añadir últimos 5 años hasta el año actual
    for (let year = currentYear; year >= currentYear - 4; year--) {
      this.anos.push({ valor: year.toString(), nombre: year.toString() });
    }
  }

  // Método para cargar las ventas y aplicar filtros
  cargarVentas(): void {
    console.log('Cargando ventas...');
    this.ventaservice.listarVentas().subscribe(
      data => {
        console.log('Datos de ventas recibidos:', data);
        
        // Verificar la estructura de la respuesta
        if (!data || !data.ventas) {
          console.error('La respuesta de la API no contiene ventas:', data);
          this.ventas = [];
          this.ventasFiltradas = [];
          this.calcularEstadisticas();
          return;
        }
          this.ventas = data.ventas;
        console.log('Ventas cargadas:', this.ventas.length);
        
        // Actualizar años disponibles basado en datos reales
        this.obtenerAnosDisponibles();
        
        // Verificar formato de fechas en los datos
        if (this.ventas.length > 0) {
          const primerVenta = this.ventas[0];
          console.log('Formato de la primera venta:', {
            id: primerVenta.id,
            fecha: primerVenta.fechaVenta,
            formaPago: primerVenta.formaPago,
            total: primerVenta.total
          });
          
          try {
            const fechaParsed = new Date(primerVenta.fechaVenta);
            console.log('Fecha parseada:', {
              fecha: fechaParsed,
              año: fechaParsed.getFullYear(),
              mes: fechaParsed.getMonth() + 1
            });
          } catch (error) {
            console.error('Error al parsear la fecha:', error);
          }
        }
        
        // Aplicar filtros iniciales
        this.aplicarFiltros();
      },
      error => {
        console.error('Error al cargar ventas:', error);
        this.ventas = [];
        this.ventasFiltradas = [];
        this.calcularEstadisticas();
      }
    );
  }

  // Método para aplicar filtros por mes y año
  aplicarFiltros(): void {
    console.log('Aplicando filtros - Mes:', this.mesSeleccionado, 'Año:', this.anoSeleccionado);
    
    this.ventasFiltradas = this.ventas.filter(venta => {
      if (!venta.fechaVenta) return false;
      
      try {
        const fechaVenta = new Date(venta.fechaVenta);
        
        // Filtro por mes
        if (this.mesSeleccionado && this.mesSeleccionado !== '') {
          const mesVenta = (fechaVenta.getMonth() + 1).toString();
          if (mesVenta !== this.mesSeleccionado) {
            return false;
          }
        }
        
        // Filtro por año
        if (this.anoSeleccionado && this.anoSeleccionado !== '') {
          const anoVenta = fechaVenta.getFullYear().toString();
          if (anoVenta !== this.anoSeleccionado) {
            return false;
          }
        }
        
        return true;
      } catch (error) {
        console.error('Error al parsear fecha de venta:', venta.fechaVenta, error);
        return false;
      }
    });
    
    console.log('Ventas filtradas:', this.ventasFiltradas.length, 'de', this.ventas.length);
    this.calcularEstadisticas();
  }

  // Método llamado cuando cambia el filtro de mes
  onMesChange(): void {
    console.log('Mes seleccionado:', this.mesSeleccionado);
    this.aplicarFiltros();
  }

  // Método llamado cuando cambia el filtro de año
  onAnoChange(): void {
    console.log('Año seleccionado:', this.anoSeleccionado);
    this.aplicarFiltros();
  }

  // Limpiar todos los filtros
  limpiarFiltros(): void {
    this.mesSeleccionado = '';
    this.anoSeleccionado = '';
    this.aplicarFiltros();
    console.log('Filtros limpiados');
  }

  // Obtener texto descriptivo del filtro aplicado
  obtenerTextoFiltro(): string {
    const partes: string[] = [];
    
    if (this.mesSeleccionado) {
      const mes = this.meses.find(m => m.valor === this.mesSeleccionado);
      if (mes) {
        partes.push(mes.nombre);
      }
    }
    
    if (this.anoSeleccionado) {
      partes.push(this.anoSeleccionado);
    }
    
    return partes.length > 0 ? partes.join(' de ') : 'Todos los periodos';
  }

  // Verificar si hay filtros activos
  hayFiltrosActivos(): boolean {
    return !!(this.mesSeleccionado || this.anoSeleccionado);
  }

  // Obtener años únicos de las ventas cargadas (método alternativo)
  obtenerAnosDisponibles(): void {
    if (this.ventas.length === 0) return;
    
    const anosUnicos = new Set<number>();
    this.ventas.forEach(venta => {
      try {
        const fecha = new Date(venta.fechaVenta);
        anosUnicos.add(fecha.getFullYear());
      } catch (error) {
        console.error('Error al parsear fecha:', venta.fechaVenta);
      }
    });
    
    // Actualizar años disponibles basado en datos reales
    const anosOrdenados = Array.from(anosUnicos).sort((a, b) => b - a);
    this.anos = [{ valor: '', nombre: 'Todos los años' }];
    anosOrdenados.forEach(ano => {
      this.anos.push({ valor: ano.toString(), nombre: ano.toString() });
    });
    
    console.log('Años disponibles actualizados:', this.anos);
  }

  calcularEstadisticas(): void {
    console.log('Calculando estadísticas con', this.ventasFiltradas.length, 'ventas filtradas');
    this.debito = 0;
    this.credito = 0;
    this.efectivo = 0;
    this.creditolocal = 0;

    if (!this.ventasFiltradas || this.ventasFiltradas.length === 0) {
      console.log('No hay ventas filtradas para calcular estadísticas');
      this.ganancias = 0;
      return;
    }

    for (const venta of this.ventasFiltradas) {
      if (!venta.total) {
        console.log('Venta sin total:', venta);
        continue;
      }
      
      if (venta.formaPago === 'DEBITO') {
        this.debito += venta.total;
      } else if (venta.formaPago === 'CREDITO') { 
        this.credito += venta.total;
      } 
      else if (venta.formaPago === 'EFECTIVO') {
        this.efectivo += venta.total;
      } else if (venta.formaPago === 'FIADO') {
        this.creditolocal += venta.total;
      }
    }
    this.ganancias = this.debito + this.credito + this.efectivo + this.creditolocal;
    console.log('Estadísticas calculadas:', {
      debito: this.debito,
      credito: this.credito,
      efectivo: this.efectivo,
      creditolocal: this.creditolocal,
      ganancias: this.ganancias
    });
  }

}
