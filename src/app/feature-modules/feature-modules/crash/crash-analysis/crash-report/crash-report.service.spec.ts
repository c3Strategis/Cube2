import { TestBed } from '@angular/core/testing';

import { CrashReportService } from './crash-report.service';

describe('CrashReportService', () => {
  let service: CrashReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrashReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
