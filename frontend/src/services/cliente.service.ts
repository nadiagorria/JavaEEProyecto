import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ClienteDto } from '../models/cliente.dto';
import { clienteCreditoDto } from 'src/models/clienteCredito.dto';
import { UrlService } from 'src/services/url.service';
import { CreditoDto } from 'src/models';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {

  private endpoint: string = '/entidad';

  constructor(
    private http: HttpClient,
    private urlService: UrlService,
  ) {}

  getCliente(id: number): Observable<ClienteDto> {
      const params = new HttpParams().set('id', id.toString());
      return this.http.get<ClienteDto>(`${this.urlService.baseUrl}${this.endpoint}/seleccionarCliente`, 
        { params });
  }

  crearCliente(cliente: ClienteDto): Observable<String> {
    return this.http.post(`${this.urlService.baseUrl}${this.endpoint}/cliente`, cliente, 
      { responseType: 'text' });
  }

  crearClienteCredito(clienteCreditoDto: clienteCreditoDto): Observable<String> {
    return this.http.post(`${this.urlService.baseUrl}${this.endpoint}/clienteCredito`, 
      clienteCreditoDto,
      { responseType: 'text'}, 
    );
  }

}
