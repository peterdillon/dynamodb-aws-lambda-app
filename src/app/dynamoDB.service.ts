import { Injectable, signal,  } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface Data {
  id: string;
  name: string;
  price: string;
};

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

  getData(): Observable<any[]> {
    return this.http.get<any[]>(this.url);
  }

  deleteItem(id: string): Observable<any> {
    return this.http.delete<any>(`${this.url}/${id}`, this.httpOptions);
  }

  addEditItem(formValues: any): Observable<any> {
    const body = {id: formValues.id, price: formValues.price, name: formValues.name};
    return this.http.put<any>(this.url, body, this.httpOptions);
  }

}
