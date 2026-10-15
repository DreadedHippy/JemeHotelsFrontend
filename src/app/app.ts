import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from '@openng/optimus-ui/toast';
import { AuthService } from './services/auth';
import { AdminNavigation } from './components/admin-navigation/admin-navigation';

@Component({
  imports: [RouterOutlet, ToastModule, AdminNavigation],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private auth = inject(AuthService);
  protected isAdmin = computed(() => this.auth.isAuthenticated() && this.auth.role() === 'Admin');
  protected readonly title = signal('JemeHotelsFrontend');
}
