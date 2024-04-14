import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrashBoxesComponent } from './crash-boxes.component';

describe('CrashBoxesComponent', () => {
  let component: CrashBoxesComponent;
  let fixture: ComponentFixture<CrashBoxesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrashBoxesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrashBoxesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
