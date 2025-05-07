import { Component } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-header-component',
  imports: [MenubarModule, DialogModule],
  templateUrl: './header-component.component.html',
  styleUrl: './header-component.component.scss'
  })
export class HeaderComponentComponent {
    nombre: string = "Felipe";
    showModal: boolean = false;


    items: any[] = [
        { label: ' ', icon: 'pi pi-user', routerLink: '/about' },
        { label: ' ', icon: 'pi pi-bell', command: () => this.showModal = true},
    ]
}
