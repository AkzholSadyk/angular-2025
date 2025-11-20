import { Route } from '@angular/router';
import { Home } from './pages/home/home';
import { About} from './pages/about/about';
import { ItemsList } from './components/items-list/items-list';
import { ItemDetails } from './components/item-details/item-details';
import { Login} from './pages/login/login';
import { Signup } from './pages/signup/signup';
import { Profile } from './pages/profile/profile';
import { AuthGuard } from './guards/auth-guard';

export const routes: Route[] = [
  { path: '', component: Home },
  { path: 'about', component: About },
  { path: 'items', component: ItemsList },
  { path: 'items/:id', component: ItemDetails },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'profile', component: Profile, canActivate: [AuthGuard] },
];
