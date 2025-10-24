import { Routes } from '@angular/router';
import { DiagnosisFormComponent } from './components/diagnosis-form/diagnosis-form.component';
import { MedicineListComponent } from './components/medicine-list/medicine-list.component';
import { CartComponent } from './components/cart/cart.component';
import { ChatComponent } from './components/chat/chat.component';

export const routes: Routes = [
  { path: '', component: DiagnosisFormComponent },
  { path: 'diagnosis', component: DiagnosisFormComponent },
  { path: 'medicines', component: MedicineListComponent },
  { path: 'cart', component: CartComponent },
  { path: 'chat', component: ChatComponent }
];
