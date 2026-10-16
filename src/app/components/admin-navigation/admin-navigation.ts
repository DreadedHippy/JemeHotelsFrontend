import { Component, computed, DestroyRef, inject } from '@angular/core';
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
  readonly isAdmin = computed(() => this.auth.isAuthenticated() && this.auth.role() === 'Admin');
  private readonly adminLinks = [
    { label: 'Home', path: '/', icon: '⌂', description: 'JemeHotels welcome page' },
    { label: 'Bookings', path: '/bookings', icon: '▤', description: 'All guest reservations' },
    { label: 'Rooms', path: '/rooms', icon: '▦', description: 'View and add rooms' },
    { label: 'Guests', path: '/guest', icon: '♙', description: 'Guests and admin access' },
  ];
  readonly links = computed(() => this.isAdmin() ? this.adminLinks : this.adminLinks
    .filter((link) => link.path === '/' || link.path === '/rooms' || link.path === '/bookings')
    .map((link) => ({
      ...link,
      description: link.path === '/bookings' ? 'Your stays and payments'
        : link.path === '/rooms' ? 'Find and book a room' : link.description,
    })));

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
