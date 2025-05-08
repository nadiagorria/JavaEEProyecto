import { Component } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-header',
  imports: [MenubarModule, DialogModule, ButtonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
  })
export class HeaderComponent {
    nombre: string = "Felipe";
    showModal: boolean = false;

     openNotifications() {
        this.showModal = true;
     }

}
