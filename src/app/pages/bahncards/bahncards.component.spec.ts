import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BahncardsComponent } from './bahncards.component';

describe('BahncardsComponent', () => {
  let component: BahncardsComponent;
  let fixture: ComponentFixture<BahncardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BahncardsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BahncardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
