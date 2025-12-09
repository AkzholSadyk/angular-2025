import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FavoritesService } from '../../services/favorites.service';
import { Observable, of } from 'rxjs';
import { Item } from '../../services/items.service';

@Component({
  selector: 'app-item-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.css']
})
export class ItemCardComponent implements OnInit, OnChanges {
  @Input() item!: Item;
  isFavorite$!: Observable<boolean>;

  constructor(private favoritesService: FavoritesService) {}

  ngOnInit(): void {
    if (this.item?.id) {
      this.isFavorite$ = this.favoritesService.isFavorite(this.item.id);
    } else {
      this.isFavorite$ = of(false);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item'] && this.item?.id) {
      this.isFavorite$ = this.favoritesService.isFavorite(this.item.id);
    }
  }

  toggleFavorite(event: Event): void {
    event.preventDefault(); // Предотвращаем переход по ссылке
    event.stopPropagation(); // Предотвращаем всплытие события
    if (this.item?.id) {
      this.favoritesService.toggleFavorite(this.item.id);
    }
  }
}