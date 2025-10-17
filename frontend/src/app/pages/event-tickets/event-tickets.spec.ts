import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventTickets } from './event-tickets';

describe('EventTickets', () => {
  let component: EventTickets;
  let fixture: ComponentFixture<EventTickets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventTickets]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventTickets);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
