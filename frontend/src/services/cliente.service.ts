import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ClienteDto } from '../models/cliente.dto';
import { UrlService } from 'url.service';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {

  constructor(
    private http: HttpClient,
    private urlService: UrlService
  ) {}

  getCliente(id: number): Observable<ClienteDto> {
     const params = new HttpParams().set('id', id.toString());
     return this.http.get<ClienteDto>(`${this.urlService.baseUrl}/seleccionarCliente`, { params })
  }

}
