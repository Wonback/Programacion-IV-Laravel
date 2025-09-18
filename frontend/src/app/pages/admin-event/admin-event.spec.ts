import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEvent } from './admin-event';

describe('AdminEvent', () => {
  let component: AdminEvent;
  let fixture: ComponentFixture<AdminEvent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEvent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEvent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
