import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class UrlShortnerService {

  serviceUrl: string='';
  constructor(private http: HttpClient) {
    this.serviceUrl= 'http';
  }
}
