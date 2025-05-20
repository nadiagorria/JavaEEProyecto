import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TableModule } from 'primeng/table';
import { ClienteDto } from '../../models/cliente.dto';
import { ClienteService } from '../../services/cliente.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-cliente-perfil',
  imports: [HeaderComponent, FooterComponent, ButtonModule, InputGroupModule, InputGroupAddonModule, TableModule],
  templateUrl: './cliente-perfil.component.html',
  styleUrl: './cliente-perfil.component.scss'
})
export class ClientePerfilComponent {

  cliente!: ClienteDto;

  compras: any[] = [];


  constructor(
    private route: ActivatedRoute,
    private clienteService: ClienteService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.clienteService.getCliente(1).subscribe(data => {
    this.cliente = data;
    console.log(this.cliente);
    });
  }

  pago:number = 200;

  currentPage: number = 1;
  totalPages: number = 5;
  totalRecords: number = 2;
  currentRange: number = 0;

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

}
