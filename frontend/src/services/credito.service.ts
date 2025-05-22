// src/app/services/credito.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreditoDto } from '../models/credito.dto';
import { Observable } from 'rxjs';
import { UrlService } from '../services/url.service';

@Injectable(
  { providedIn: 'root' }
)
export class CreditoService {

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
}
