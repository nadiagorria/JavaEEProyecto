import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevaventaComponent } from './nuevaventa.component';

describe('NuevaventaComponent', () => {
  let component: NuevaventaComponent;
  let fixture: ComponentFixture<NuevaventaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevaventaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NuevaventaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
