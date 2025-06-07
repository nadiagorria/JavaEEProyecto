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
    // Asegurarnos de que la fecha sea una string en formato ISO
    const lotePayload = {
      ...lote,
      fechaVencimiento: lote.fechaVencimiento instanceof Date 
        ? lote.fechaVencimiento.toISOString().split('T')[0] 
        : lote.fechaVencimiento
    };
    
    console.log('Enviando lote al servidor:', lotePayload);
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