import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ItemsState, itemsFeatureKey } from './items.reducer';

export const selectItemsFeature = createFeatureSelector<ItemsState>(itemsFeatureKey);

export const selectItemsList = createSelector(
  selectItemsFeature,
  (s) => s.items
);

export const selectListLoading = createSelector(
  selectItemsFeature,
  (s) => s.loadingList
);

export const selectListError = createSelector(
  selectItemsFeature,
  (s) => s.listError
);

export const selectSelectedItem = createSelector(
  selectItemsFeature,
  (s) => s.selectedItem
);

export const selectDetailsLoading = createSelector(
  selectItemsFeature,
  (s) => s.loadingDetails
);

export const selectDetailsError = createSelector(
  selectItemsFeature,
  (s) => s.detailsError
);
