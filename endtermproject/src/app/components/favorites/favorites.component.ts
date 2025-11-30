import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, switchMap, of, combineLatest } from 'rxjs';
import { FavoritesService } from '../../services/favorites.service';
import { ItemsService, Item } from '../../services/items.service';
import { ItemCardComponent } from '../item-card/item-card.component';
import { RouterModule } from '@angular/router';
import { map } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, ItemCardComponent, RouterModule, FormsModule],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  favoritesItems$!: Observable<Item[]>;
  loading = false;
  error: any = null;

  constructor(
    private favoritesService: FavoritesService,
    private itemsService: ItemsService
  ) {}

  ngOnInit(): void {
    this.favoritesItems$ = this.favoritesService.favorites$.pipe(
      switchMap(favoriteIds => {
        if (favoriteIds.length === 0) {
          return of([]);
        }
        this.loading = true;
        const itemRequests = favoriteIds.map(id => this.itemsService.getItemById(id));
        
        return combineLatest(itemRequests).pipe(
          map(items => {
            this.loading = false;
            return items;
          })
        );
      })
    );
  }
}
