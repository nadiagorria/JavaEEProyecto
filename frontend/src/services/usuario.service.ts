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
  }  modificarUsuario(username: string, cambios: { email: string, currentPassword: string, newPassword: string }): Observable<any> {
    const userData = {
      mail: cambios.email,
      nombre: username,
      contrasenia: cambios.currentPassword, // Enviamos la contraseña actual para verificación
      nuevaContrasenia: cambios.newPassword // Nueva propiedad para la nueva contraseña
    };

    return this.http.put(
      `${this.urlService.baseUrl}${this.endpoint}/${username}`,
      userData,
      { responseType: 'text' }
    );
  }
  obtenerUsuarioPorNombre(username: string): Observable<UsuarioDto> {
    return this.http.get<UsuarioDto>(`${this.urlService.baseUrl}${this.endpoint}/${username}`);
  }

  obtenerTodosLosUsuarios(): Observable<UsuarioDto[]> {
    return this.http.get<UsuarioDto[]>(`${this.urlService.baseUrl}${this.endpoint}`);
  }
}