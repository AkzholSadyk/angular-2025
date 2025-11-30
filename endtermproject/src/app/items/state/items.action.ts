import { createAction, props } from '@ngrx/store';
import { Item } from '../../services/items.service';


export const loadItems = createAction(
  '[Items] Load Items',
  props<{ query?: string | null, limit?: number, skip?: number }>()
);

export const loadItemsSuccess = createAction(
  '[Items] Load Items Success',
  props<{ items: Item[], total: number }>()
);

export const loadItemsFailure = createAction(
  '[Items] Load Items Failure',
  props<{ error: any }>()
);


export const loadItem = createAction(
  '[Items] Load Item',
  props<{ id: string | number }>()
);

export const loadItemSuccess = createAction(
  '[Items] Load Item Success',
  props<{ item: Item }>()
);

export const loadItemFailure = createAction(
  '[Items] Load Item Failure',
  props<{ error: any }>()
);
