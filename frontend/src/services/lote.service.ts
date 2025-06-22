import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoteDto } from '../models/lote.dto';
import { UrlService } from './url.service';

@Injectable({
  providedIn: 'root',
})
export class LoteService {
  private endpoint: string = '/lote';
  constructor(private http: HttpClient, private urlService: UrlService) {}

  crearLote(lote: LoteDto): Observable<any> {
    console.log('🚀 SERVICIO - Payload completo:', lote);

    return this.http.post(
      `${this.urlService.baseUrl}${this.endpoint}/crear`,
      lote,
      {
        responseType: 'text',
      }
    );
  }
  eliminarLote(id: number): Observable<string> {
    return this.http.put(
      `${this.urlService.baseUrl}${this.endpoint}/${id}/eliminar`,
      {},
      {
        responseType: 'text',
      }
    );
  }
}
