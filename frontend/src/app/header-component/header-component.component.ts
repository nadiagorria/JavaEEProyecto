import { Component } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-header-component',
  imports: [MenubarModule, DialogModule, ButtonModule],
  templateUrl: './header-component.component.html',
  styleUrl: './header-component.component.scss'
  })
export class HeaderComponentComponent {
    nombre: string = "Felipe";
    showModal: boolean = false;

     openNotifications() {
        this.showModal = true;
     }

}
