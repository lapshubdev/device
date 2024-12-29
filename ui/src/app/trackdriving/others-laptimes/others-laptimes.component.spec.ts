import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OthersLaptimesComponent } from './others-laptimes.component';

describe('OthersLaptimesComponent', () => {
  let component: OthersLaptimesComponent;
  let fixture: ComponentFixture<OthersLaptimesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OthersLaptimesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OthersLaptimesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
