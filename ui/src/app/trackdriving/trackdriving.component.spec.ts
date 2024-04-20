import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackdrivingComponent } from './trackdriving.component';

describe('TrackdrivingComponent', () => {
  let component: TrackdrivingComponent;
  let fixture: ComponentFixture<TrackdrivingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrackdrivingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrackdrivingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
