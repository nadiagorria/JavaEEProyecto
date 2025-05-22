// src/app/services/credito.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Credito } from '../models/credito.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CreditoService {
  private apiUrl = 'http://localhost:8080/api/creditos';

  constructor(private http: HttpClient) {}

  getCredito(id: number): Observable<Credito> {
    return this.http.get<Credito>(`${this.apiUrl}/${id}`);
  }

  crearCredito(credito: Credito): Observable<Credito> {
    return this.http.post<Credito>(this.apiUrl, credito);
  }
}
