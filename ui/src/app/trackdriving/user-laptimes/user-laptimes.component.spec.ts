import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserLaptimesComponent } from './user-laptimes.component';

describe('UserLaptimesComponent', () => {
  let component: UserLaptimesComponent;
  let fixture: ComponentFixture<UserLaptimesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserLaptimesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserLaptimesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
