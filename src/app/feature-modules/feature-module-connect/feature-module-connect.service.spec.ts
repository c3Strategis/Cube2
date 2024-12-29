import { TestBed } from '@angular/core/testing';

import { FeatureModuleConnectService } from './feature-module-connect.service';

describe('FeatureModuleConnectService', () => {
  let service: FeatureModuleConnectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeatureModuleConnectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
