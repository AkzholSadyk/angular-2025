import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ItemsService, Item } from '../../services/items.service';
import { ItemCardComponent } from '../item-card/item-card.component';

@Component({
  selector: 'app-items-list',
  standalone: true,
  imports: [CommonModule, ItemCardComponent, RouterModule],
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.css']
})
export class ItemsListComponent implements OnInit {
  items: Item[] = [];
  loading = false;
  error = '';

  constructor(
    private itemsService: ItemsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const query = params.get('q') || '';
      this.fetchItems(query);
    });
  }

  fetchItems(query: string) {
    this.loading = true;
    this.error = '';
    this.itemsService.getItems(query).subscribe({
      next: data => {
        this.items = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error loading items';
        this.loading = false;
      }
    });
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.router.navigate([], { queryParams: { q: input.value } });
  }
}