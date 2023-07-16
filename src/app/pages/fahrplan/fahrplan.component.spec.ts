import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FahrplanComponent } from './fahrplan.component';

describe('FahrplanComponent', () => {
  let component: FahrplanComponent;
  let fixture: ComponentFixture<FahrplanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FahrplanComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FahrplanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
