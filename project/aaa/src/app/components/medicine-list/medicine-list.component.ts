import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MedicineApiService } from '../../services/medicine-api.service';

@Component({
  selector: 'app-medicine-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medicine-list.html',
  styleUrls: ['./medicine-list.css']
})
export class MedicineListComponent implements OnInit {
  medicines: any[] = [];
  filteredMedicines: any[] = [];
  diagnosis = '';
  loading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private medicineService: MedicineApiService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.diagnosis = params['diagnosis'] || '';
      if (this.diagnosis) {
        this.loadMedicines(this.diagnosis);
      }
    });
  }

  loadMedicines(diagnosis: string) {
    this.loading = true;
    this.errorMessage = '';
    this.medicines = [];
    this.filteredMedicines = [];

    this.medicineService.getMedicinesByDiagnosis(diagnosis).subscribe({
      next: (data) => {
        this.loading = false;
        this.medicines = data.results || [];
        this.filteredMedicines = this.medicines;
        if (this.filteredMedicines.length === 0) {
          this.errorMessage = `No medicines found for "${diagnosis}"`;
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error:', err);
        this.errorMessage = 'Error loading data from API.';
      }
    });
  }

  addToCart(med: any) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const medicineData = {
      brand: med.openfda?.brand_name?.[0] || 'Unknown',
      generic: med.openfda?.generic_name?.[0] || '—',
      purpose: med.purpose?.[0] || '—'
    };


    const exists = cart.some((item: any) => item.brand === medicineData.brand);
    if (!exists) {
      cart.push(medicineData);
      localStorage.setItem('cart', JSON.stringify(cart));
      alert(`${medicineData.brand} added to cart!`);
    } else {
      alert(`${medicineData.brand} is already in the cart.`);
    }
  }
}
