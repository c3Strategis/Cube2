import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrashMapComponent } from './crash-map.component';

describe('CrashMapComponent', () => {
  let component: CrashMapComponent;
  let fixture: ComponentFixture<CrashMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrashMapComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrashMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
