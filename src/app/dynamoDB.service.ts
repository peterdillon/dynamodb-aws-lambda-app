import { Injectable  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Api } from './utils';

export interface Data {
  id: string;
  name: string;
  price: string;
};

@Injectable({
  providedIn: 'root'
})

export class DynamoDBService {

  constructor( private http: HttpClient ) { }

  getData(): Observable<any[]> {
    return this.http.get<any[]>(Api.url);
  }

  deleteItem(id: string): Observable<any> {
    return this.http.delete<any>(`${Api.url}/${id}`, Api.httpOptions);
  }

  addEditItem(formValues: any): Observable<any> {
    const body = {id: formValues.id, price: formValues.price, name: formValues.name};
    return this.http.put<any>(Api.url, body, Api.httpOptions);
  }

}
