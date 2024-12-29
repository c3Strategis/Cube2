import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrashReportComponent } from './crash-report.component';

describe('CrashReportComponent', () => {
  let component: CrashReportComponent;
  let fixture: ComponentFixture<CrashReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrashReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrashReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
