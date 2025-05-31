import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { SecurityService } from '../services/security.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: SecurityService,
    private router: Router) { }  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.isLoggedIn()) {
      const userRoles = this.authService.getUserRoles();
      const routeRoles = route.data['roles'];
      
      // Si no se especifican roles requeridos, permitir acceso solo con autenticación
      if (!routeRoles || routeRoles.length === 0) {
        return true;
      }
      
      // Verificar si el usuario tiene los roles requeridos
      const hasRequiredRole = userRoles && userRoles.some((userRole: any) => routeRoles.includes(userRole));
      if (hasRequiredRole) {
        return true;
      } else {
        this.router.navigateByUrl('/home');
        return false;
      }

    } else {
      this.router.navigateByUrl('/login');
      return false;
    }
  }

}
