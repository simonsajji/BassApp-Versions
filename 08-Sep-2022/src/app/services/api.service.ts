import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }
  authToken: any;
  
  getToken() {
    if (this.authToken) return this.authToken;
    else {
      let token = localStorage.getItem('userToken');
      if (token === null) return '';
      else return token;
    }
  }

  setHeaders() {
    let header = new HttpHeaders();
    header = header.set('Authorization', `Bearer ${this.getToken()}`);
    return header;
  }

  post(url:any, data:any): Observable<any> {
    return this.http.post(url, data, { headers: this.setHeaders() });
  }

  get(url:any): Observable<any> {
    return this.http.get(url, { headers: this.setHeaders() });
  }

}
