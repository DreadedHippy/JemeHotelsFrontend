import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Guest as GuestService } from '../../services/guest';
import { GuestResult } from '../../interfaces/guest';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from '@openng/optimus-ui/inputtext';

@Component({
  imports: [ButtonModule, DialogModule, RouterLink, ReactiveFormsModule, InputTextModule],
  selector: 'app-guest',
  styleUrl: './guest.scss',
  templateUrl: './guest.html',
})
export class Guest implements OnInit {
  private guestSrv = inject(GuestService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);
  guests = signal<GuestResult[]>([]);
  isLoading = signal(false);
  loadError = signal('');
  pageNumber = signal(1);
  readonly pageSize = 20;
  selectedUsername = signal('');
  usernameError = signal('');
  elevationForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] }),
  });
  confirmationVisible = false;
  isElevating = signal(false);
  elevationError = signal('');
  elevatedGuests = signal<Record<string, boolean>>({});

  ngOnInit(): void {
    this.loadGuests();
  }

  loadGuests(page = this.pageNumber()): void {
    if (!this.isAdmin() || this.isLoading() || this.isElevating() || page < 1) return;
    this.isLoading.set(true);
    this.loadError.set('');
    this.guestSrv.retrieveGuests(page, this.pageSize)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (guests) => {
          this.guests.set(guests);
          this.pageNumber.set(page);
        },
        error: () => this.loadError.set('Unable to load guests. Please try again.'),
      });
  }

  confirmElevation(): void {
    if (!this.isAdmin() || this.isElevating()) return;
    this.usernameError.set('');
    if (this.elevationForm.invalid) {
      this.elevationForm.markAllAsDirty();
      return;
    }
    const username = this.elevationForm.controls.username.value.trim();
    if (this.elevatedGuests()[username]) {
      this.usernameError.set('Admin access has already been granted to this username.');
      return;
    }
    this.selectedUsername.set(username);
    this.elevationError.set('');
    this.confirmationVisible = true;
  }

  elevateGuest(): void {
    const username = this.selectedUsername();
    if (!this.isAdmin() || !username || this.isElevating() || this.elevatedGuests()[username]) return;
    this.isElevating.set(true);
    this.elevationError.set('');
    this.guestSrv.elevateGuestToAdmin(username)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.isElevating.set(false)))
      .subscribe({
        next: () => {
          this.elevatedGuests.update((guests) => ({ ...guests, [username]: true }));
          this.confirmationVisible = false;
          this.elevationForm.reset();
          this.usernameError.set('');
          this.toast.showSuccess(`${username} now has admin access.`);
        },
        error: () => this.elevationError.set('Unable to elevate this guest. Check the username and try again.'),
      });
  }

  private isAdmin(): boolean {
    return this.auth.isAuthenticated() && this.auth.role() === 'Admin';
  }
}
