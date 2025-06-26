import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProveedorPerfilComponent } from './proveedor-perfil.component';

describe('ProveedorPerfilComponent', () => {
  let component: ProveedorPerfilComponent;
  let fixture: ComponentFixture<ProveedorPerfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProveedorPerfilComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProveedorPerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
