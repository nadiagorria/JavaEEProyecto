// src/app/services/credito.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Credito } from '../models/credito.model';
import { Observable } from 'rxjs';
import { UrlService } from 'url.service';

@Injectable(
  { providedIn: 'root' }
)
export class CreditoService {

  constructor(
    private http: HttpClient,
    private urlService: UrlService
  ) {}

  getCredito(id: number): Observable<Credito> {
      return this.http.get<Credito>(`${this.urlService.baseUrl}/${id}`);
  }

  crearCredito(credito: Credito): Observable<Credito> {
    return this.http.post<Credito>(this.urlService.baseUrl, credito);
  }
}
