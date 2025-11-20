import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Item {
  id: number;
  name: string;
  description: string;
  category?: string;
  price?: number;
  rating?: number;
  image?: string;
}

@Injectable({ providedIn: 'root' })
export class ItemsService {
  private apiUrl = 'https://fakestoreapi.com/products'; 

  constructor(private http: HttpClient) {}

  getItems(query?: string): Observable<Item[]> {
    let params = new HttpParams();
    if (query) {
      params = params.set('q', query);
    }
    return this.http.get<Item[]>(this.apiUrl, { params });
  }

  getItemById(id: string | number): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrl}/${id}`);
  }
}
