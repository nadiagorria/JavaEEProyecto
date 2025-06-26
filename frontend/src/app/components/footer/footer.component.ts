import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { SecurityService } from '../../../services/security.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [ButtonModule, RouterModule, CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  constructor(private securityService: SecurityService) {}

  isAdmin(): boolean {
    const roles = this.securityService.getUserRoles();

    if (!roles) {
      return false;
    }

    const hasAdminRole = roles.includes('ADMIN');

    return hasAdminRole;
  }
}
