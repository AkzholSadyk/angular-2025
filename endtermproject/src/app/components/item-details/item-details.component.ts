import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, map, switchMap, of } from 'rxjs';
import { Item } from '../../services/items.service';
import { Location } from '@angular/common';
import { FavoritesService } from '../../services/favorites.service';

import * as ItemsActions from '../../items/state/items.action';
import * as ItemsSelectors from '../../items/state/items.selectors';

@Component({
  selector: 'app-item-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.css']
})
export class ItemDetailsComponent implements OnInit {
  item$!: Observable<Item | null>;
  loading$!: Observable<boolean>;
  error$!: Observable<any>;
  isFavorite$!: Observable<boolean>;

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    private location: Location,
    private favoritesService: FavoritesService
  ) {}

  ngOnInit() {
    this.item$ = this.store.select(ItemsSelectors.selectSelectedItem);
    this.loading$ = this.store.select(ItemsSelectors.selectDetailsLoading);
    this.error$ = this.store.select(ItemsSelectors.selectDetailsError);

    const id = this.route.snapshot.paramMap.get('id')!;
    this.store.dispatch(ItemsActions.loadItem({ id }));

    // Инициализируем isFavorite$ на основе загруженного item
    this.isFavorite$ = this.item$.pipe(
      switchMap(item => {
        if (item?.id) {
          return this.favoritesService.isFavorite(item.id);
        }
        return of(false);
      })
    );
  }

  toggleFavorite(itemId: number): void {
    this.favoritesService.toggleFavorite(itemId);
  }

  goBack() {
    this.location.back();
  }
}
