import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SecurityService } from 'src/services/security.service';

@Component({
  selector: 'app-home',
  imports: [HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  constructor(
    private router: Router,
    private securityService: SecurityService
  ) {}

  navegarA(ruta: string): void {
    this.router.navigate([ruta]);
  }

  isAdmin(): boolean {
    const roles = this.securityService.getUserRoles();

    if (!roles) {
      return false;
    }

    const hasAdminRole = roles.includes('ADMIN');

    return hasAdminRole;
  }
}
