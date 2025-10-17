import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketScanner } from './ticket-scanner';

describe('TicketScanner', () => {
  let component: TicketScanner;
  let fixture: ComponentFixture<TicketScanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketScanner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketScanner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
