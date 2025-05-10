import { Component, Input } from '@angular/core';
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
    private _nombreUsuario = '';

    @Input()
      set nombreUsuario(valor: string) {
        this._nombreUsuario = '@' + valor;
      }

      get nombreUsuario(): string {
        return this._nombreUsuario;
      }

    showModal: boolean = false;

     openNotifications() {
        this.showModal = true;
     }

}
