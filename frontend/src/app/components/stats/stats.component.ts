import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ProductoService } from 'src/services/producto.service';
import { CategoriaDto, ProductoDto } from 'src/models';


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

  ganancias: number = 0;

  constructor(
    private route: ActivatedRoute,
    private productoservice: ProductoService
  ) {}

  n = 3; //de cuanto es el top N de productos que se quiere obtener
  ngOnInit(): void {
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
      
      console.log('Categorías más populares:', this.categoriasMasPopulares);
    });
  }

}
