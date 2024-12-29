import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureModuleConnectComponent } from './feature-module-connect.component';

describe('FeatureModuleConnectComponent', () => {
  let component: FeatureModuleConnectComponent;
  let fixture: ComponentFixture<FeatureModuleConnectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureModuleConnectComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FeatureModuleConnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
