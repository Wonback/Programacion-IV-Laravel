import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyAccount } from './verify-account';

describe('VerifyAccount', () => {
  let component: VerifyAccount;
  let fixture: ComponentFixture<VerifyAccount>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyAccount]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyAccount);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
