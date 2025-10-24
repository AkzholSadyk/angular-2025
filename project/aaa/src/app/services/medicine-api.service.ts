import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MedicineApiService {
  private baseUrl = 'https://api.fda.gov/drug/label.json';

  constructor(private http: HttpClient) {}


  getMedicinesByDiagnosis(diagnosis: string): Observable<any> {
    
    const query = encodeURIComponent(diagnosis);
    const url = `${this.baseUrl}?search=indications_and_usage:${query}&limit=50`;
    return this.http.get(url);
  }
}
