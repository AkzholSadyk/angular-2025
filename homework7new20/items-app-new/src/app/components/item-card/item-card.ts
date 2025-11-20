import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Item } from '../../services/items';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-item-card',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './item-card.html',
  styleUrls: ['./item-card.css']
})
export class ItemCard {
  @Input() item!: Item;
}
