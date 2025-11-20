import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, AsyncPipe } from '@angular/common';
import { AuthService } from '../../services/auth';

export const Navbar = {
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, AsyncPipe],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  setup(auth: AuthService) {
    const user$ = auth.currentUser$;
    const logout = () => auth.logout().subscribe({ next: () => console.log('Logged out') });
    return { user$, logout };
  }
};
