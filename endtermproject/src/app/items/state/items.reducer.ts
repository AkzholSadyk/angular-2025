import { createReducer, on } from '@ngrx/store';
import * as ItemsActions from './items.action';
import { Item } from '../../services/items.service';

export const itemsFeatureKey = 'items';

export interface ItemsState {
  items: Item[];
  totalItems: number;
  selectedItem: Item | null;
  loadingList: boolean;
  loadingDetails: boolean;
  listError: any | null;
  detailsError: any | null;
}

export const initialItemsState: ItemsState = {
  items: [],
  totalItems: 0,
  selectedItem: null,
  loadingList: false,
  loadingDetails: false,
  listError: null,
  detailsError: null,
};

export const itemsReducer = createReducer(
  initialItemsState,

  
  on(ItemsActions.loadItems, (state) => ({
    ...state,
    loadingList: true,
    listError: null
  })),
  on(ItemsActions.loadItemsSuccess, (state, { items, total }) => ({
    ...state,
    loadingList: false,
    items,
    totalItems: total,
    listError: null
  })),
  on(ItemsActions.loadItemsFailure, (state, { error }) => ({
    ...state,
    loadingList: false,
    listError: error
  })),


  on(ItemsActions.loadItem, (state) => ({
    ...state,
    loadingDetails: true,
    detailsError: null,
    selectedItem: null 
  })),
  on(ItemsActions.loadItemSuccess, (state, { item }) => ({
    ...state,
    loadingDetails: false,
    selectedItem: item,
    detailsError: null
  })),
  on(ItemsActions.loadItemFailure, (state, { error }) => ({
    ...state,
    loadingDetails: false,
    detailsError: error,
    selectedItem: null
  }))
);
