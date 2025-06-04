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
  ) {}

  crearLote(lote: LoteDto): Observable<string> {
    return this.http.post<string>(`${this.urlService.baseUrl}${this.endpoint}/crear`, lote);
  }

  eliminarLote(id: number): Observable<string> {
    return this.http.put<string>(`${this.urlService.baseUrl}${this.endpoint}/${id}/eliminar`, {});
  }
}