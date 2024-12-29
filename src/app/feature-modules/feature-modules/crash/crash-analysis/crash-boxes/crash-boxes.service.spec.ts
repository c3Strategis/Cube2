import { TestBed } from '@angular/core/testing';

import { CrashBoxesService } from './crash-boxes.service';

describe('CrashBoxesService', () => {
  let service: CrashBoxesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrashBoxesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
