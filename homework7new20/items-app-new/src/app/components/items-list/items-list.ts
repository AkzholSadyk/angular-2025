import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ItemsService, Item } from '../../services/items';
import { ItemCard } from '../item-card/item-card';

@Component({
  selector: 'app-items-list',
  standalone: true,
  imports: [CommonModule, ItemCard, RouterLink],
  templateUrl: './items-list.html',
  styleUrls: ['./items-list.css']
})
export class ItemsList {
  items = signal<Item[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  query = signal('');

  constructor(private itemsService: ItemsService, private route: ActivatedRoute, private router: Router) {
    effect(() => {
      const q = this.route.snapshot.queryParamMap.get('q') || '';
      this.query.set(q);
      this.loadItems(q);
    });
  }

  loadItems(query?: string) {
    this.loading.set(true);
    this.error.set(null);
    this.itemsService.getItems(query).subscribe({
      next: data => this.items.set(data),
      error: err => this.error.set(err.message),
      complete: () => this.loading.set(false)
    });
  }

  search() {
    this.router.navigate([], { queryParams: { q: this.query() } });
  }
}
