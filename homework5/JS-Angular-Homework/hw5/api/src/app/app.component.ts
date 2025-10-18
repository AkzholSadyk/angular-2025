import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoviesListComponent } from './movies-list/movies-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MoviesListComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {}