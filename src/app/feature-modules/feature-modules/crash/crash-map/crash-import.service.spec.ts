import { TestBed } from '@angular/core/testing';

import { CrashImportService } from './crash-import.service';

describe('CrashImportService', () => {
  let service: CrashImportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrashImportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
