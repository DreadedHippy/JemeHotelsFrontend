import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private auth = inject(AuthService);
  isLoggedIn = computed(() => this.auth.isAuthenticated());
  isAdmin = computed(() => this.isLoggedIn() && this.auth.role() === 'Admin');
}
