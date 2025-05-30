// src/app/services/credito.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProveedorDto } from '../models/proveedor.dto';
import { Observable } from 'rxjs';
import { UrlService } from '../services/url.service';

@Injectable(
  { providedIn: 'root' }
)
export class ProveedorService {
  private endpoint: string = '/proveedores';

  constructor(
    private http: HttpClient,
    private urlService: UrlService
  ) {}

  getProveedor(id: number): Observable<ProveedorDto> {
      return this.http.get<ProveedorDto>(`${this.urlService.baseUrl}/${id}`);
  }

  crearProveedor(credito: ProveedorDto): Observable<ProveedorDto> {
    return this.http.post<ProveedorDto>(this.urlService.baseUrl, credito);
  }

  listarProveedores(): Observable<{creditos: ProveedorDto[]}> {
    return this.http.get<{creditos: ProveedorDto[]}>(`${this.urlService.baseUrl}${this.endpoint}/listar`);
  }

}   
