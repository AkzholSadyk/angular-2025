import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Medicine } from '../../models/medicine.model';

@Component({
  selector: 'app-medicine-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medicine-card.html',
  styleUrls: ['./medicine-card.css']
})
export class MedicineCardComponent {
  @Input() medicine!: Medicine;

  addToCart() {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push(this.medicine);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${this.medicine.name} added to cart!`);
  }
}
