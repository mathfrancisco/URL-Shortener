import { TestBed } from '@angular/core/testing';

import { UrlShorterService } from './url-shortner.service';

describe('UrlShortnerService', () => {
  let service: UrlShorterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UrlShorterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
