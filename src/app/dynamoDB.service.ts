import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class DynamoDBService {
  url = 'https://eky3iequs9.execute-api.us-east-1.amazonaws.com/items';
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
    })
  };

  constructor( private http: HttpClient ) { }

  getData(): Observable<any> {
    return this.http.get(this.url);
  }

  deleteData(id: string) {
    const body = {id: id};
    this.http.delete(this.url+'/'+id, this.httpOptions)
        .subscribe(res => console.log(res));
  }

  saveData(id: string, price: string, name: string) {
    const body = {id: id, price: price, name: name};
    this.http.put(this.url, body, this.httpOptions)
        .subscribe(res => console.log(res));
  }
}
