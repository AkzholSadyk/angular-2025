import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Item } from '../../services/items.service';
import * as ItemsActions from '../../items/state/items.action';
import * as ItemsSelectors from '../../items/state/items.selectors';
import { ItemCardComponent } from '../item-card/item-card.component';

@Component({
  selector: 'app-items-list',
  standalone: true,
  imports: [CommonModule, ItemCardComponent, RouterModule],
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.css']
})
export class ItemsListComponent implements OnInit {
  items$!: Observable<Item[]>;
  loading$!: Observable<boolean>;
  error$!: Observable<any>;

  constructor(private store: Store, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.items$ = this.store.select(ItemsSelectors.selectItemsList);
    this.loading$ = this.store.select(ItemsSelectors.selectListLoading);
    this.error$ = this.store.select(ItemsSelectors.selectListError);

    this.route.queryParamMap.subscribe(params => {
      const query = params.get('q') || '';
      this.store.dispatch(ItemsActions.loadItems({ query }));
    });
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.router.navigate([], { queryParams: { q: input.value } });
  }
}
