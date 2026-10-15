import { Component, DestroyRef, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DrawerModule } from '@openng/optimus-ui/drawer';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-admin-navigation',
  imports: [NgTemplateOutlet, RouterLink, RouterLinkActive, DrawerModule],
  templateUrl: './admin-navigation.html',
  styleUrl: './admin-navigation.scss',
})
export class AdminNavigation {
  private auth = inject(AuthService);
  private router = inject(Router);
  menuVisible = false;
  readonly links = [
    { label: 'Home', path: '/', icon: '⌂', description: 'JemeHotels welcome page' },
    { label: 'Bookings', path: '/bookings', icon: '▤', description: 'All guest reservations' },
    { label: 'Rooms', path: '/rooms', icon: '▦', description: 'View and add rooms' },
    { label: 'Guests', path: '/guest', icon: '♙', description: 'Guests and admin access' },
  ];

  constructor() {
    this.router.events.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe((event) => {
      if (event instanceof NavigationEnd) this.menuVisible = false;
    });
  }

  logout(): void {
    this.menuVisible = false;
    this.auth.logout();
  }
}
