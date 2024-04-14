import { TestBed } from '@angular/core/testing';

import { CrashService } from './crash-analysis/crash.service';

describe('CrashService', () => {
  let service: CrashService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrashService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
