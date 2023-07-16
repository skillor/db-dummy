import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutragBearbeitenComponent } from './autrag-bearbeiten.component';

describe('AutragBearbeitenComponent', () => {
  let component: AutragBearbeitenComponent;
  let fixture: ComponentFixture<AutragBearbeitenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutragBearbeitenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutragBearbeitenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
