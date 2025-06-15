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

  constructor(
    private route: ActivatedRoute,
    private productoservice: ProductoService,
    private ventaservice: VentaService,
    private usuarioservice: UsuarioService
  ) {}

  n = 3; //de cuanto es el top N de productos que se quiere obtener
  ngOnInit(): void {
    this.ventaservice.getVentasTotales().subscribe(data => {
      this.ventasTotales = data;
    });

    this.usuarioservice.getUsuariosTotales().subscribe(data => {
      this.usuariosTotales = data;
    });

    this.productoservice.buscarTopNProductos(this.n).subscribe(data => {
      console.log('Respuesta completa:', data);
      this.productosMasPopulares = data.productos;
      console.log('Productos más populares:', this.productosMasPopulares);
      
      // Limpiar categorías antes de llenar
      this.categoriasMasPopulares = [];
      
      this.productosMasPopulares.forEach(producto => {
        if (producto.categoria) {
          this.categoriasMasPopulares.push(producto.categoria);
        }
      });
        this.ventaservice.listarVentas().subscribe(data => {

        this.ventas = data.ventas || [];
        this.ventasFiltradas = [...this.ventas]; 
        this.calcularEstadisticas();
      });
    });
  }
  // Método para filtrar ventas por mes
  filtrarPorMes(): void {
    if (this.mesSeleccionado === '') {
      this.ventasFiltradas = [...this.ventas];
    } else {
      this.ventasFiltradas = this.ventas.filter(venta => {
        const fechaVenta = new Date(venta.fechaVenta);
        const mesVenta = fechaVenta.getMonth() + 1; // getMonth() devuelve 0-11, necesitamos 1-12
        return mesVenta.toString() === this.mesSeleccionado;
      });
    }
    this.calcularEstadisticas();
  }

  calcularEstadisticas(): void {
    this.debito = 0;
    this.credito = 0;
    this.efectivo = 0;
    this.creditolocal = 0;

    for (const venta of this.ventasFiltradas) {
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
  }

}
