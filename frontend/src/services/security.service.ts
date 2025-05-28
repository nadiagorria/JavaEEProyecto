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
  }
  getUserName() {
    if (this.user && this.user.nombreUsuario) {
      return this.user.nombreUsuario;
    }
    // Si no hay usuario, intentar cargar desde localStorage
    if (this.isLoggedIn() && this.user && this.user.nombreUsuario) {
      return this.user.nombreUsuario;
    }
    return null;
  }

  getUserRoles() {
    return this.user.roles;
  }
  public isLoggedIn() {
    if (localStorage.getItem('USER') !== null) {
      let item = localStorage.getItem('USER')?.toString();
      const cadena: string = item !== undefined ? item : '';
      try {
        const decryptedData = this.convertText("decrypt", cadena);
        this.user = JSON.parse(decryptedData || "{}");
        return true;
      } catch (error) {
        console.error('Error al desencriptar datos del usuario:', error);
        // Si hay error, limpiar localStorage
        localStorage.removeItem('USER');
        localStorage.removeItem('token');
        return false;
      }
    } else {
      return false;
    }
  }

  public logout() {
  localStorage.removeItem('USER');
  localStorage.removeItem('token');
  this.router.navigate(['/login']);
}
}
