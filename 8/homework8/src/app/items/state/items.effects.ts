import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as ItemsActions from './items.action';
import { ItemsService } from '../../services/items.service';
import { switchMap, map, catchError, of } from 'rxjs';

@Injectable()
export class ItemsEffects {
  private actions$ = inject(Actions);
  private itemsService = inject(ItemsService);

  loadItems$ = createEffect(() =>
  this.actions$.pipe(
    ofType(ItemsActions.loadItems),
    switchMap(({ query }) =>
      this.itemsService.getItems(query ?? undefined).pipe(
        map(items => ItemsActions.loadItemsSuccess({ items })),
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