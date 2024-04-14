import { TestBed } from '@angular/core/testing';

import { CrashMapService } from './crash-map.service';

describe('CrashMapService', () => {
  let service: CrashMapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrashMapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
