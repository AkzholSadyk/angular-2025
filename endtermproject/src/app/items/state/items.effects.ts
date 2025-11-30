import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as ItemsActions from './items.action';
import { ItemsService } from '../../services/items.service';
import { switchMap, map, catchError, of, debounceTime, distinctUntilChanged } from 'rxjs';

@Injectable()
export class ItemsEffects {
  private actions$ = inject(Actions);
  private itemsService = inject(ItemsService);

  loadItems$ = createEffect(() =>
  this.actions$.pipe(
    ofType(ItemsActions.loadItems),
    debounceTime(300), // Задержка 300 мс
    distinctUntilChanged(), // Пропускает, если предыдущее значение было таким же
    switchMap(({ query, limit, skip }) =>
      this.itemsService.getItems(query ?? undefined, limit, skip).pipe(
        map(result => ItemsActions.loadItemsSuccess({ items: result.items, total: result.total })),
        catchError(error => of(ItemsActions.loadItemsFailure({ error })))
      )
    )
  )
);


  loadItem$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ItemsActions.loadItem),
      switchMap(({ id }) =>
        this.itemsService.getItemById(id).pipe(
          map(item => ItemsActions.loadItemSuccess({ item })),
          catchError(error => of(ItemsActions.loadItemFailure({ error })))
        )
      )
    )
  );
}