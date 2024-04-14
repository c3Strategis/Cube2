import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrashAnalysisComponent } from './crash-analysis.component';

describe('CrashAnalysisComponent', () => {
  let component: CrashAnalysisComponent;
  let fixture: ComponentFixture<CrashAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrashAnalysisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrashAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
