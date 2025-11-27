import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface Item {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  thumbnail: string;
  rating: number;
}

@Injectable({
  providedIn: 'root'
})
export class ItemsService {
  private apiUrl = 'https://dummyjson.com/products';

  constructor(private http: HttpClient) {}
  getItems(query?: string, limit: number = 20): Observable<{ products: Item[] }> {
    const url = query
      ? `${this.apiUrl}/search?q=${query}&limit=${limit}`
      : `${this.apiUrl}?limit=${limit}`;
    return this.http.get<{ products: Item[] }>(url).pipe(
      catchError(err => {
        console.error('Error fetching items', err);
        return throwError(() => new Error('Failed to load items'));
      })
    );
  }

  getItemById(id: string | number): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => {
        console.error('Error fetching item by id', err);
        return throwError(() => new Error('Failed to load item details'));
      })
    );
  }
}
