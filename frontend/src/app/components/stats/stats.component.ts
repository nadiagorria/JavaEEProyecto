import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ProductoService } from 'src/services/producto.service';
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
  categoriasMasPopulares: Pick<CategoriaDto, "id" | "nombre">[] = [];
  ventas: VentaDto[] = [];
  ventasFiltradas: VentaDto[] = [];

  ganancias: number = 0;

  debito: number = 0;
  credito: number = 0;
  efectivo: number = 0;
  creditolocal: number = 0;

  // Propiedades para el filtro de meses
  mesSeleccionado: string = '';
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
  
  // Propiedades para el filtro de años
  anoSeleccionado: string = '';
  anos: { valor: string, nombre: string }[] = [];

  constructor(
    private route: ActivatedRoute,
    private productoservice: ProductoService,
    private ventaservice: VentaService,
    private usuarioservice: UsuarioService
  ) {}

  n = 3; // de cuanto es el top N de productos que se quiere obtener
  ngOnInit(): void {
    // Establecer el año actual como seleccionado por defecto
    const currentYear = new Date().getFullYear().toString();
    this.anoSeleccionado = currentYear;
    console.log('Año seleccionado por defecto:', this.anoSeleccionado);
    console.log('Años disponibles al iniciar:', this.anos);

    // Cargar datos de totales
    this.ventaservice.getVentasTotales().subscribe(data => {
      this.ventasTotales = data;
      console.log('Ventas totales cargadas:', this.ventasTotales);
    });

    this.usuarioservice.getUsuariosTotales().subscribe(data => {
      this.usuariosTotales = data;
      console.log('Usuarios totales cargados:', this.usuariosTotales);
    });

    // Cargar productos populares
    this.productoservice.buscarTopNProductos(this.n).subscribe(data => {
      console.log('Respuesta completa de productos:', data);
      this.productosMasPopulares = data.productos || [];
      console.log('Productos más populares:', this.productosMasPopulares);
      
      this.categoriasMasPopulares = [];
      
      this.productosMasPopulares.forEach(producto => {
        if (producto.categoria) {
          this.categoriasMasPopulares.push(producto.categoria);
        }
      });

      // Cargar ventas después de productos
      this.cargarVentas();
    },
    error => {
      console.error('Error al cargar productos populares:', error);
      // Cargar ventas incluso si falla la carga de productos
      this.cargarVentas();
    });
  }
  
  // Método para cargar las ventas y aplicar filtros
  cargarVentas(): void {
    console.log('Cargando ventas...');
    this.ventaservice.listarVentas().subscribe(
      data => {
        console.log('Datos de ventas recibidos:', data);
        this.ventas = data.ventas || [];
        console.log('Ventas cargadas:', this.ventas.length);
        this.ventasFiltradas = [...this.ventas];
        this.filtrarPorMes();
      },
      error => {
        console.error('Error al cargar ventas:', error);
        this.ventas = [];
        this.ventasFiltradas = [];
        this.calcularEstadisticas();
      }
    );
  }
    // Método para cargar los años disponibles en las ventas
  cargarAniosDisponibles(): void {
    // Inicializar con opción para todos los años
    this.anos = [{ valor: '', nombre: 'Todos los años' }];
    
    // Añadir años predefinidos desde 2020 hasta el año actual (2025)
    const currentYear = new Date().getFullYear();
    for (let year = 2020; year <= currentYear; year++) {
      this.anos.push({ valor: year.toString(), nombre: year.toString() });
    }
    console.log('Años disponibles cargados:', this.anos);
  }
  
  // Método para filtrar ventas por mes y año
  filtrarPorMes(): void {
    console.log('Filtrando ventas por mes:', this.mesSeleccionado, 'y año:', this.anoSeleccionado);
    console.log('Total de ventas antes de filtrar:', this.ventas.length);
    
    if (!this.ventas || this.ventas.length === 0) {
      console.log('No hay ventas para filtrar');
      this.ventasFiltradas = [];
      this.calcularEstadisticas();
      return;
    }
    
    this.ventasFiltradas = this.ventas.filter(venta => {
      if (!venta.fechaVenta) {
        console.log('Venta sin fecha:', venta);
        return false;
      }
      
      const fechaVenta = new Date(venta.fechaVenta);
      const mesVenta = fechaVenta.getMonth() + 1; // getMonth() devuelve 0-11, necesitamos 1-12
      const anioVenta = fechaVenta.getFullYear().toString();
      
      // Filtrar por mes si está seleccionado
      const cumpleMes = this.mesSeleccionado === '' || mesVenta.toString() === this.mesSeleccionado;
      
      // Filtrar por año si está seleccionado
      const cumpleAnio = this.anoSeleccionado === '' || anioVenta === this.anoSeleccionado;
      
      // Debe cumplir ambos filtros
      return cumpleMes && cumpleAnio;
    });
    
    console.log('Ventas filtradas:', this.ventasFiltradas.length);
    this.calcularEstadisticas();
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
