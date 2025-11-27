import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ItemsService, Item } from '../../services/items';

@Component({
  selector: 'app-items-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './items-list.html',
  styleUrls: ['./items-list.css']
})
export class ItemsList implements OnInit {
  items: Item[] = [];
  loading = false;
  error = '';
  search = '';

  constructor(
    private itemsService: ItemsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.search = params.get('q') || '';
      this.loadItems(this.search);
    });
  }

  loadItems(query?: string) {
    this.loading = true;
    this.error = '';
    this.itemsService.getItems(query).subscribe({
      next: res => {
        this.items = res.products;
        this.loading = false;
      },
      error: err => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.search = value;
  }

  
  onSearchSubmit() {
    this.router.navigate([], { queryParams: this.search ? { q: this.search } : {} });
    this.loadItems(this.search);
  }
}
