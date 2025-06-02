import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ProductoService } from 'src/services/producto.service';
import { CategoriaDto, ProductoDto, VentaDto} from 'src/models';
import { VentaService } from 'src/services/venta.service';
import { UsuarioService } from 'src/services/usuario.service';


@Component({
  selector: 'app-stats',
  imports: [HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {

  ventasTotales: number = 0;
  usuariosTotales: number = 0;
  
  productosMasPopulares: ProductoDto[] = [];
  categoriasMasPopulares: Pick<CategoriaDto, "id" | "nombre">[] = [];
  ventas: VentaDto[] = [];

  ganancias: number = 0;

  debito: number = 0;
  credito: number = 0;
  efectivo: number = 0;
  creditolocal: number = 0;

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

        this.debito = 0;
        this.credito = 0;
        this.efectivo = 0;
        this.creditolocal = 0;

        for (const venta of this.ventas) {
         
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
      });
    });
  }

}
