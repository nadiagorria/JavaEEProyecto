import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';


@Component({
  selector: 'app-stats',
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss'
})
export class StatsComponent {

  ventasTotales: number = 0;

  usuariosTotales: number = 0;

  productosMasPopulares: any[] = [];
  
  categoriasMasPopulares: any[] = [];

  ganancias: number = 0;

}
