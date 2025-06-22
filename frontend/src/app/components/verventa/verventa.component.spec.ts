import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerventaComponent } from './verventa.component';

describe('VerventaComponent', () => {
  let component: VerventaComponent;
  let fixture: ComponentFixture<VerventaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerventaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VerventaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
