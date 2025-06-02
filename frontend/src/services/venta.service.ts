import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VentaDto, VentaSimpleDto } from '../models';
import { UrlService } from './url.service';

@Injectable({
  providedIn: 'root'
})

export class VentaService {
  private endpoint: string = '/venta';

  constructor(
    private http: HttpClient,
    private urlService: UrlService
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
  
  crearVenta(venta: VentaDto): Observable<{id: number}> {
    return this.http.post<{id: number}>(`${this.urlService.baseUrl}${this.endpoint}/crear`, venta);
  }

  eliminarVenta(id: number): Observable<string> {
    return this.http.put<string>(`${this.urlService.baseUrl}${this.endpoint}/${id}/eliminar`, {});
  }

  listarVentas(): Observable<any> {
    return this.http.get<any>(`${this.urlService.baseUrl}${this.endpoint}`);
  }

  obtenerVenta(id: number): Observable<VentaSimpleDto> {
    return this.http.get<VentaSimpleDto>(`${this.urlService.baseUrl}${this.endpoint}/${id}`);
  }

  getVentasTotales(): Observable<number> {
    return this.http.get<number>(`${this.urlService.baseUrl}${this.endpoint}/cantidadVentas`);
  }
}
