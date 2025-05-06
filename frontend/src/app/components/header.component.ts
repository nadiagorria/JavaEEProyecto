import { Component } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';

@Component({
    selector: 'header',
    templateUrl: '../html/header.html',
    standalone: true,
    imports: [MenubarModule]
})

export class HeaderComponent {
  items = [
    { label: 'Inicio', icon: 'pi pi-home', routerLink: '/' },
    { label: 'Acerca de', icon: 'pi pi-info', routerLink: '/about' }
  ];
}
