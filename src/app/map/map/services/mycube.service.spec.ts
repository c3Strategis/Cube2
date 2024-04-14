import { TestBed } from '@angular/core/testing';

import { MycubeService } from './mycube.service';

describe('MycubeService', () => {
  let service: MycubeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MycubeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
