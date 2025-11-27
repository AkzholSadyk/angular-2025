import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ItemsService, Item } from '../../services/items.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-item-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.css']
})
export class ItemDetailsComponent implements OnInit {
  item?: Item;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private itemsService: ItemsService,
    private location: Location
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.itemsService.getItemById(id).subscribe({
      next: data => { this.item = data; this.loading = false; },
      error: () => { this.error = 'Item not found'; this.loading = false; }
    });
  }

  goBack() {
    this.location.back();
  }
}