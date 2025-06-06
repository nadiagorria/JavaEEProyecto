import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UrlService } from './url.service';
import * as CryptoJS from 'crypto-js';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private endpoint: string = '/seguridad';
  user: any;
  
  constructor(
    private http: HttpClient,
    private urlService: UrlService,
    private router: Router
  ) { }

  login(username: string, contrasenia: string): Observable<any> {
    const credentials = new URLSearchParams();
    credentials.set('usuario', username);
    credentials.set('password', contrasenia);

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    
    return this.http.post(
      `${this.urlService.baseUrl}${this.endpoint}/autenticacion`,
      credentials.toString(), 
      { headers /*, withCredentials: true*/ }
    );
  }
  register(username: string, email: string, password: string, isAdmin: boolean = false): Observable<any> {
    const registrationData = new URLSearchParams();
    registrationData.set('username', username);
    registrationData.set('email', email);
    registrationData.set('password', password);
    registrationData.set('admin', isAdmin.toString());

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    
    return this.http.post(
      `${this.urlService.baseUrl}${this.endpoint}/registro`,
      registrationData.toString(), 
      { headers }
    );
  }

  checkUsername(username: string): Observable<any> {
    return this.http.get(
      `${this.urlService.baseUrl}${this.endpoint}/verificar-usuario/${username}`
    );
  }

  obtenerRoles(): Observable<any> {
    return this.http.get(
      `${this.urlService.baseUrl}${this.endpoint}/obtenerPerfiles`,
      { withCredentials: true }
    );
  }

  convertText(conversion: string, cadena: string) {
    if (conversion == "encrypt") {
      return CryptoJS.AES.encrypt(cadena.trim(), '@BYF2025').toString();
    }
    else {
      return CryptoJS.AES.decrypt(cadena.trim(), '@BYF2025').toString(CryptoJS.enc.Utf8);
    }
  }  getUserName() {
    //console.log('getUserName llamado, usuario actual:', this.user);
    
    if (this.user && this.user.nombreUsuario) {
      //console.log('Devolviendo nombreUsuario:', this.user.nombreUsuario);
      return this.user.nombreUsuario;
    }
    
    // Si no hay usuario, intentar cargar desde localStorage
    //console.log('Usuario no encontrado, intentando cargar desde localStorage...');
    if (this.isLoggedIn() && this.user && this.user.nombreUsuario) {
      //console.log('Usuario cargado desde localStorage:', this.user.nombreUsuario);
      return this.user.nombreUsuario;
    }
    
    //console.log('No se pudo obtener el nombre de usuario');
    return null;
  }

  getUserRoles() {
    return this.user.roles;
  }  public isLoggedIn() {
    //console.log('isLoggedIn llamado');
    
    if (localStorage.getItem('USER') !== null) {
      //console.log('USER encontrado en localStorage');
      let item = localStorage.getItem('USER')?.toString();
      const cadena: string = item !== undefined ? item : '';
      try {
        const decryptedData = this.convertText("decrypt", cadena);
       // console.log('Datos desencriptados:', decryptedData);
        this.user = JSON.parse(decryptedData || "{}");
        //console.log('Usuario parseado:', this.user);
        return true;
      } catch (error) {
        //console.error('Error al desencriptar datos del usuario:', error);
        // Si hay error, limpiar localStorage
        localStorage.removeItem('USER');
        localStorage.removeItem('token');
        return false;
      }
    } else {
      //console.log('No hay USER en localStorage');
      return false;
    }
  }

  public logout() {
  localStorage.removeItem('USER');
  localStorage.removeItem('token');
  this.router.navigate(['/login']);
}
}
