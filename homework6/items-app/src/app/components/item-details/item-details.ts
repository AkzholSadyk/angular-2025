import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ItemsService, Item } from '../../services/items';
import { Location } from '@angular/common';

@Component({
  selector: 'app-item-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './item-details.html',
  styleUrls: ['./item-details.css']
})
export class ItemDetails implements OnInit {
  item?: Item;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private service: ItemsService,
    private location: Location
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadItem(id);
  }

  loadItem(id: string) {
    this.loading = true;
    this.service.getItemById(id).subscribe({
      next: item => {
        this.item = item;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load item';
        this.loading = false;
      }
    });
  }

  back() {
    this.location.back(); 
  }
}
