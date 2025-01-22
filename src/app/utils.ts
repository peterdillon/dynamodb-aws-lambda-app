import { HttpHeaders } from "@angular/common/http";

export class Api {
    public static readonly url = 'https://eky3iequs9.execute-api.us-east-1.amazonaws.com/items';
    public static readonly httpOptions = { 
        headers: new HttpHeaders({ 'Content-Type':  'application/json' })
    };
}