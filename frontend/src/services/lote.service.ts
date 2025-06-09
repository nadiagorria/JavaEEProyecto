import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoteDto } from '../models/lote.dto';
import { UrlService } from './url.service';

@Injectable({
  providedIn: 'root'
})
export class LoteService {
  private endpoint: string = '/lote';

  constructor(
    private http: HttpClient,
    private urlService: UrlService
  ) {}  crearLote(lote: LoteDto): Observable<any> {
    
    let fechaFormateada: string;
    
    if (lote.fechaVencimiento instanceof Date) {
      // Usamos getFullYear, getMonth, getDate para evitar problemas de zona horaria
      const fecha = lote.fechaVencimiento;
      
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      fechaFormateada = `${year}-${month}-${day}`;
      
    } else if (typeof lote.fechaVencimiento === 'string') {
      // Si ya es string, asumimos que está en formato YYYY-MM-DD
      fechaFormateada = lote.fechaVencimiento;
    } else {
      const hoy = new Date();
      const year = hoy.getFullYear();
      const month = String(hoy.getMonth() + 1).padStart(2, '0');
      const day = String(hoy.getDate()).padStart(2, '0');
      fechaFormateada = `${year}-${month}-${day}`;
    }
    
    const lotePayload = {
      ...lote,
      fechaVencimiento: fechaFormateada
    };
    
    console.log('🚀 SERVICIO - Fecha formateada final:', fechaFormateada);
    console.log('🚀 SERVICIO - Payload completo:', lotePayload);
    
    // Usamos { responseType: 'text' } para manejar respuestas en texto plano
    return this.http.post(`${this.urlService.baseUrl}${this.endpoint}/crear`, lotePayload, { 
      responseType: 'text' 
    });
  }
  eliminarLote(id: number): Observable<string> {
    return this.http.put(`${this.urlService.baseUrl}${this.endpoint}/${id}/eliminar`, {}, {
      responseType: 'text'
    });
  }
}