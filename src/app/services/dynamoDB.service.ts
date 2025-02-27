import { Injectable  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Api } from '../utils';
import { v4 as uuidv4 } from 'uuid';

export interface Data {
  id: string;
  name: string;
  project: string;
  description: string;
  type: string;
  assigned: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})

export class DynamoDBService {

  uid = "";
  createGuid() {
    return this.uid = uuidv4();
  }
  
  constructor( private http: HttpClient ) { }

  getData(): Observable<any[]> {
    return this.http.get<any[]>(Api.url);
  }

  deleteItem(id: string): Observable<any> {
    return this.http.delete<any>(`${Api.url}/${id}`, Api.httpOptions);
  }

  addEditItem(formValues: any): Observable<any> {
    let myGuid: string;
    formValues.id ? myGuid = formValues.id : myGuid  = this.createGuid();
    const body = {
      id: myGuid, 
      project: formValues.project, 
      description: formValues.description, 
      name: formValues.name,
      type: formValues.type,
      assigned: formValues.assigned,
      createdAt: new Date().getTime()
    };
    console.log(body);
    return this.http.put<any>(Api.url, body, Api.httpOptions);
  }

}
