import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UrlService } from './url.service';

export interface ContactoDto {
  nombre: string;
  email: string;
  mensaje: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContactoService {
  private endpoint: string = '/contacto';

  constructor(
    private http: HttpClient,
    private urlService: UrlService
  ) {}

  enviarMensajeContacto(contacto: ContactoDto): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post(
      `${this.urlService.baseUrl}${this.endpoint}/enviar`,
      contacto,
      { headers }
    );
  }
}
