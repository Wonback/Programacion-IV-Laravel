import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTickets } from './my-tickets';

describe('MyTickets', () => {
  let component: MyTickets;
  let fixture: ComponentFixture<MyTickets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyTickets]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyTickets);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
