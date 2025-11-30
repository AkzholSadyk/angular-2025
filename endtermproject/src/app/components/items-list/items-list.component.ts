import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, takeUntil, Subject, combineLatest } from 'rxjs';
import { Item } from '../../services/items.service';
import * as ItemsActions from '../../items/state/items.action';
import * as ItemsSelectors from '../../items/state/items.selectors';
import { ItemCardComponent } from '../item-card/item-card.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-items-list',
  standalone: true,
  imports: [CommonModule, ItemCardComponent, RouterModule, FormsModule],
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.css']
})
export class ItemsListComponent implements OnInit {
  private destroy$ = new Subject<void>();
  items$!: Observable<Item[]>;
  totalItems$!: Observable<number>;
  limitOptions = [5, 10, 20];
  currentLimit = 10;
  currentPage = 1;
  totalPages = 0;
  loading$!: Observable<boolean>;
  error$!: Observable<any>;

  constructor(private store: Store, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.items$ = this.store.select(ItemsSelectors.selectItemsList);
    this.loading$ = this.store.select(ItemsSelectors.selectListLoading);
    this.error$ = this.store.select(ItemsSelectors.selectListError);
    this.totalItems$ = this.store.select(ItemsSelectors.selectTotalItems);

    this.totalItems$.pipe(takeUntil(this.destroy$)).subscribe(total => {
      this.totalPages = Math.ceil(total / this.currentLimit);
    });

    this.route.queryParamMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const query = params.get('q') || '';
      const limit = parseInt(params.get('limit') || this.currentLimit.toString(), 10);
      const page = parseInt(params.get('page') || this.currentPage.toString(), 10);

      this.currentLimit = limit;
      this.currentPage = page;
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
}
