import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Item {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  rating: { rate: number; count: number };
  thumbnail: string; 
  images: string[];  
}

@Injectable({
  providedIn: 'root'
})
export class ItemsService {
  private API_URL = 'https://dummyjson.com/products';

  constructor(private http: HttpClient) {}

  getItems(query?: string, page?: number): Observable<Item[]> {
    if (query) {
      return this.http
        .get<{ products: Item[] }>(`${this.API_URL}/search`, { params: { q: query } })
        .pipe(map(res => res.products));
    }
    return this.http
      .get<{ products: Item[] }>(`${this.API_URL}`)
      .pipe(map(res => res.products));
  }

  getItemById(id: number | string): Observable<Item> {
    return this.http.get<Item>(`${this.API_URL}/${id}`);
  }
}