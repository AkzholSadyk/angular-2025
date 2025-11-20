import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemsService, Item } from '../../services/items';

@Component({
  selector: 'app-item-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item-details.html',
  styleUrls: ['./item-details.css']
})
export class ItemDetails {
  item = signal<Item | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private itemsService: ItemsService, private route: ActivatedRoute, private router: Router) {
    effect(() => {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) this.loadItem(id);
    });
  }

  loadItem(id: string) {
    this.loading.set(true);
    this.error.set(null);
    this.itemsService.getItemById(id).subscribe({
      next: data => this.item.set(data),
      error: err => this.error.set(err.message),
      complete: () => this.loading.set(false)
    });
  }

  back() {
    this.router.navigate(['/items']);
  }
}
