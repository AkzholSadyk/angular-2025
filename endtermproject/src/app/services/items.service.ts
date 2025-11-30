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

  getItems(query?: string, limit: number = 10, skip: number = 0): Observable<{ items: Item[], total: number }> {
    const params: any = { limit: limit.toString(), skip: skip.toString() };
    let url = this.API_URL;

    if (query) {
      url = `${this.API_URL}/search`;
      params.q = query;
    }

    return this.http
      .get<{ products: Item[], total: number }>(url, { params })
      .pipe(map(res => ({ items: res.products, total: res.total })));
  }

  getItemById(id: number | string): Observable<Item> {
    return this.http.get<Item>(`${this.API_URL}/${id}`);
  }
}