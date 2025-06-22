
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreditoDto } from '../models/credito.dto';
import { Observable } from 'rxjs';
import { UrlService } from '../services/url.service';

@Injectable(
  { providedIn: 'root' }
)
export class CreditoService {
  private endpoint: string = '/creditos';

  constructor(
    private http: HttpClient,
    private urlService: UrlService
  ) {}

  getCredito(id: number): Observable<CreditoDto> {
      return this.http.get<CreditoDto>(`${this.urlService.baseUrl}/${id}`);
  }

  crearCredito(credito: CreditoDto): Observable<CreditoDto> {
    return this.http.post<CreditoDto>(this.urlService.baseUrl, credito);
  }

  listarCreditos(): Observable<{creditos: CreditoDto[]}> {
    return this.http.get<{creditos: CreditoDto[]}>(`${this.urlService.baseUrl}${this.endpoint}/listar`);
  }

  pagarCredito(id: number, pago: number): Observable<any> {
    return this.http.post(
      `${this.urlService.baseUrl}${this.endpoint}/credito/${id}/pagar?pago=${pago}`,
      null,
      { responseType: 'text' }
    );
  }
}   
