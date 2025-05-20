import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ClienteDto } from '../models/cliente.dto';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {

  private baseUrl = 'http://localhost:8080/kioscobyf/api/v1/entidad';

  constructor(private http: HttpClient) {}

  // Obtener cliente por ID
  getCliente(id: number): Observable<ClienteDto> {
     const params = new HttpParams().set('id', id.toString());
     return this.http.get<ClienteDto>(`${this.baseUrl}/seleccionarCliente`, { params })
  }

}
