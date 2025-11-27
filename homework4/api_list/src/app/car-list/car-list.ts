


import { Component } from '@angular/core';
import { CarService } from '../car'; 

@Component({
  selector: 'app-carlist',
  standalone: true,
  imports: [],
  templateUrl: './car-list.html',
  styleUrl: './car-list.css'
})
export class CarlistComponent {
  cars: any[] = [];
  isLoaded = false;

  constructor(private carService: CarService) {}

  loadCars() {
    this.carService.getCars().subscribe(data => {
      this.cars = data.cars; // в API массив хранится в data.cars
      this.isLoaded = true;
    });
  }
}
