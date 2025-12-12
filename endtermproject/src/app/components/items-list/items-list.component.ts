import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, takeUntil, Subject, combineLatest, map } from 'rxjs';
import { Item } from '../../services/items.service';
import * as ItemsActions from '../../items/state/items.action';
import * as ItemsSelectors from '../../items/state/items.selectors';
import { ItemCardComponent } from '../item-card/item-card.component';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface FilterState {
  category: string;
  brand: string;
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number | null;
}

@Component({
  selector: 'app-items-list',
  standalone: true,
  imports: [CommonModule, ItemCardComponent, RouterModule, FormsModule, TranslatePipe],
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.css']
})
export class ItemsListComponent implements OnInit {
  private destroy$ = new Subject<void>();
  items$!: Observable<Item[]>;
  filteredItems$!: Observable<Item[]>;
  allItems$!: Observable<Item[]>;
  totalItems$!: Observable<number>;
  limitOptions = [5, 10, 20];
  currentLimit = 10;
  currentPage = 1;
  totalPages = 0;
  loading$!: Observable<boolean>;
  error$!: Observable<any>;

  // Фильтры
  filters: FilterState = {
    category: '',
    brand: '',
    minPrice: null,
    maxPrice: null,
    minRating: null
  };

  // Уникальные значения для фильтров
  categories$!: Observable<string[]>;
  brands$!: Observable<string[]>;
  showFilters = false;

  constructor(private store: Store, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.allItems$ = this.store.select(ItemsSelectors.selectItemsList);
    this.loading$ = this.store.select(ItemsSelectors.selectListLoading);
    this.error$ = this.store.select(ItemsSelectors.selectListError);
    this.totalItems$ = this.store.select(ItemsSelectors.selectTotalItems);

    // Получаем уникальные категории и бренды
    this.categories$ = this.allItems$.pipe(
      map(items => {
        const categories = [...new Set(items.map(item => item.category))].sort();
        return categories;
      })
    );

    this.brands$ = this.allItems$.pipe(
      map(items => {
        const brands = [...new Set(items.map(item => item.brand))].sort();
        return brands;
      })
    );

    // Применяем фильтры
    this.filteredItems$ = combineLatest([this.allItems$]).pipe(
      map(([items]) => this.applyFilters(items))
    );

    // Используем отфильтрованные элементы для отображения
    this.items$ = this.filteredItems$;

    // Обновляем totalPages на основе отфильтрованных элементов
    this.filteredItems$.pipe(takeUntil(this.destroy$)).subscribe(items => {
      this.totalPages = Math.ceil(items.length / this.currentLimit);
      // Сбрасываем на первую страницу при изменении фильтров
      if (this.currentPage > this.totalPages && this.totalPages > 0) {
        this.currentPage = 1;
        this.router.navigate([], { queryParams: { page: 1 }, queryParamsHandling: 'merge' });
      }
    });

    this.route.queryParamMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const query = params.get('q') || '';
      const limit = parseInt(params.get('limit') || this.currentLimit.toString(), 10);
      const page = parseInt(params.get('page') || this.currentPage.toString(), 10);
      const category = params.get('category') || '';
      const brand = params.get('brand') || '';
      const minPrice = params.get('minPrice') ? parseFloat(params.get('minPrice')!) : null;
      const maxPrice = params.get('maxPrice') ? parseFloat(params.get('maxPrice')!) : null;
      const minRating = params.get('minRating') ? parseFloat(params.get('minRating')!) : null;

      this.currentLimit = limit;
      this.currentPage = page;
      this.filters = { category, brand, minPrice, maxPrice, minRating };
      const skip = (page - 1) * limit;

      this.store.dispatch(ItemsActions.loadItems({ query, limit, skip }));
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.router.navigate([], { queryParams: { q: input.value, page: 1 }, queryParamsHandling: 'merge' });
  }

  onLimitChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const limit = parseInt(select.value, 10);
    this.router.navigate([], { queryParams: { limit: limit, page: 1 }, queryParamsHandling: 'merge' });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.router.navigate([], { queryParams: { page: page }, queryParamsHandling: 'merge' });
    }
  }

  get pages(): number[] {
    // Генерация массива номеров страниц для отображения в пагинации
    return Array(this.totalPages).fill(0).map((x, i) => i + 1);
  }

  applyFilters(items: Item[]): Item[] {
    return items.filter(item => {
      // Фильтр по категории
      if (this.filters.category && item.category !== this.filters.category) {
        return false;
      }

      // Фильтр по бренду
      if (this.filters.brand && item.brand !== this.filters.brand) {
        return false;
      }

      // Фильтр по минимальной цене
      if (this.filters.minPrice !== null && item.price < this.filters.minPrice) {
        return false;
      }

      // Фильтр по максимальной цене
      if (this.filters.maxPrice !== null && item.price > this.filters.maxPrice) {
        return false;
      }

      // Фильтр по минимальному рейтингу
      if (this.filters.minRating !== null && item.rating.rate < this.filters.minRating) {
        return false;
      }

      return true;
    });
  }

  onFilterChange() {
    // Обновляем query параметры при изменении фильтров
    const queryParams: any = { page: 1 };
    
    if (this.filters.category) queryParams.category = this.filters.category;
    if (this.filters.brand) queryParams.brand = this.filters.brand;
    if (this.filters.minPrice !== null) queryParams.minPrice = this.filters.minPrice;
    if (this.filters.maxPrice !== null) queryParams.maxPrice = this.filters.maxPrice;
    if (this.filters.minRating !== null) queryParams.minRating = this.filters.minRating;

    this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }

  clearFilters() {
    this.filters = {
      category: '',
      brand: '',
      minPrice: null,
      maxPrice: null,
      minRating: null
    };
    this.router.navigate([], { 
      queryParams: { 
        category: null, 
        brand: null, 
        minPrice: null, 
        maxPrice: null, 
        minRating: null,
        page: 1
      },
      queryParamsHandling: 'merge'
    });
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  get paginatedItems$(): Observable<Item[]> {
    return this.filteredItems$.pipe(
      map(items => {
        const start = (this.currentPage - 1) * this.currentLimit;
        const end = start + this.currentLimit;
        return items.slice(start, end);
      })
    );
  }
}
