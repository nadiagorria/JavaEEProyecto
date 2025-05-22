import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VentaDto } from '../models';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private apiUrl = `${environment.apiUrl}/venta`;

  constructor(private http: HttpClient) { }

  crearVenta(venta: VentaDto): Observable<{id: number}> {
    return this.http.post<{id: number}>(`${this.apiUrl}/crear`, venta);
  }

  eliminarVenta(id: number): Observable<string> {
    return this.http.put<string>(`${this.apiUrl}/${id}/eliminar`, {});
  }

  listarVentas(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`);
  }
}
