import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientesCreditoComponent } from './clientes-credito.component';

describe('ClientesCreditoComponent', () => {
  let component: ClientesCreditoComponent;
  let fixture: ComponentFixture<ClientesCreditoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientesCreditoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientesCreditoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
