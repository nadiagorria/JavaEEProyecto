import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioDto } from '../models';
import { UrlService } from './url.service';

@Injectable({
  providedIn: 'root'
})

export class UsuarioService {
  private endpoint: string = '/usuarios';

  constructor(
    private http: HttpClient,
    private urlService: UrlService
  ) { }

  getUsuariosTotales(): Observable<number> {
    return this.http.get<number>(`${this.urlService.baseUrl}${this.endpoint}/cantidadUsuarios`);
  }
}