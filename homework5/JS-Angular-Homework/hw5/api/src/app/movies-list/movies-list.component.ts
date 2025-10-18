import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoviesService } from '../movies.service';
import { Subject, debounceTime, switchMap, startWith, of } from 'rxjs';

@Component({
  selector: 'app-movies-list',
  standalone: true,             
  imports: [CommonModule],     
  templateUrl: './movies-list.component.html',
  styleUrls: ['./movies-list.component.css']
})
export class MoviesListComponent implements OnInit {
  movies: any[] = [];
  allMovies: any[] = [];
  searchTerm$ = new Subject<string>();

  constructor(private moviesService: MoviesService) {}

  ngOnInit(): void {
    this.moviesService.getMovies().subscribe({
      next: data => {
        this.allMovies = data;
        this.movies = data;
      },
      error: err => console.error('Ошибка при загрузке фильмов:', err)
    });

    this.searchTerm$
      .pipe(
        startWith(''),
        debounceTime(300),
        switchMap(term => of(this.filterMovies(term)))
      )
      .subscribe(filtered => (this.movies = filtered));
  }

  filterMovies(term: string): any[] {
    const value = term.toLowerCase();
    return this.allMovies.filter(movie =>
      movie.title.toLowerCase().includes(value)
    );
  }

  onSearchChange(value: string) {
    this.searchTerm$.next(value);
  }
}