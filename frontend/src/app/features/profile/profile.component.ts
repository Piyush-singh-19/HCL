import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-page animate-fade-in" *ngIf="user">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-extrabold text-white mb-1">Trader Profile & Account Settings</h2>
          <p class="text-secondary text-sm mb-0">Manage your virtual cash account, trading credentials, and personal profile information.</p>
        </div>
      </div>

      <div class="row g-4">
        <!-- Left: Profile Avatar Card & Balance Manager -->
        <div class="col-lg-4">
          <!-- Profile Card -->
          <div class="glass-card p-4 text-center mb-4">
            <div class="profile-avatar-large mx-auto mb-3">
              {{ user.fullName.charAt(0) || 'U' }}
            </div>
            <h4 class="fw-bold text-white mb-1">{{ user.fullName }}</h4>
            <div class="text-xs text-muted font-mono mb-2">&#64;{{ user.username }}</div>
            <div>
              <span class="badge" [ngClass]="user.role === 'ROLE_ADMIN' ? 'bg-amber-subtle' : 'bg-indigo-subtle'">
                {{ user.role === 'ROLE_ADMIN' ? 'SUPER ADMINISTRATOR' : 'QUANT TRADER' }}
              </span>
            </div>

            <div class="mt-4 pt-3 border-top border-glass text-start text-xs font-mono">
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">Account Status:</span>
                <span class="text-emerald fw-bold">ACTIVE</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">Registered Date:</span>
                <span class="text-white">{{ user.createdAt | date:'mediumDate' }}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-muted">Realized Lifetime P&L:</span>
                <span class="fw-bold" [ngClass]="user.realizedPnl >= 0 ? 'text-emerald' : 'text-rose'">
                  ₹{{ user.realizedPnl | number:'1.2-2' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Virtual Balance Card -->
          <div class="glass-card p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="fw-bold text-white mb-0">Virtual Capital Reserve</h6>
              <i class="fa-solid fa-coins text-amber fs-5"></i>
            </div>

            <div class="p-3 mb-3 rounded-3" style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2);">
              <span class="text-xs text-muted fw-bold">AVAILABLE LIQUID CASH</span>
              <div class="font-mono fs-3 text-emerald fw-extrabold">₹{{ user.virtualBalance | number:'1.2-2' }}</div>
            </div>

            <!-- Add Funds Input -->
            <div class="mb-3">
              <label class="form-label text-xs text-muted fw-bold">INJECT VIRTUAL FUNDS</label>
              <div class="input-group">
                <span class="input-group-text bg-black border-glass text-muted">₹</span>
                <input type="number" class="form-control form-control-glass font-mono" [(ngModel)]="depositAmount" placeholder="Amount" />
                <button class="btn btn-emerald btn-sm px-3" (click)="addFunds()">Add</button>
              </div>
            </div>

            <!-- Reset Button -->
            <button class="btn btn-outline-danger btn-sm w-100 py-2" (click)="resetBalance()">
              <i class="fa-solid fa-rotate-left me-1"></i> Reset Balance to ₹10,00,000.00
            </button>
          </div>
        </div>

        <!-- Right: Edit Profile & Security Details -->
        <div class="col-lg-8">
          <!-- Profile Form Card -->
          <div class="glass-card p-4 mb-4">
            <h5 class="fw-bold text-white mb-3">Personal & Contact Details</h5>

            <form (ngSubmit)="saveProfile()">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label text-xs text-muted fw-bold">FULL NAME</label>
                  <input type="text" class="form-control form-control-glass" [(ngModel)]="fullName" name="fullName" required />
                </div>

                <div class="col-md-6">
                  <label class="form-label text-xs text-muted fw-bold">EMAIL ADDRESS</label>
                  <input type="email" class="form-control form-control-glass font-mono" [(ngModel)]="email" name="email" required />
                </div>

                <div class="col-md-6">
                  <label class="form-label text-xs text-muted fw-bold">USERNAME (LOCKED)</label>
                  <input type="text" class="form-control form-control-glass font-mono text-muted" [value]="user.username" disabled />
                </div>

                <div class="col-md-6">
                  <label class="form-label text-xs text-muted fw-bold">ASSIGNED ROLE</label>
                  <input type="text" class="form-control form-control-glass font-mono text-muted" [value]="user.role" disabled />
                </div>
              </div>

              <div class="mt-4 pt-3 border-top border-glass d-flex justify-content-end">
                <button type="submit" class="btn btn-indigo px-4 py-2" [disabled]="isSaving">
                  <i class="fa-solid" [ngClass]="isSaving ? 'fa-spinner fa-spin' : 'fa-floppy-disk'"></i>
                  <span class="ms-1">Save Profile Changes</span>
                </button>
              </div>
            </form>
          </div>

          <!-- API & Token Credentials Card -->
          <div class="glass-card p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-bold text-white mb-0">Security & API Access Token</h5>
              <span class="badge bg-indigo-subtle font-mono text-xs">JWT BEARER</span>
            </div>

            <p class="text-xs text-secondary mb-3">Your active authentication token is automatically injected into all trading and market requests via HTTP interceptor.</p>

            <div class="token-box p-3 rounded-3 font-mono text-xs text-truncate">
              {{ authService.token() || 'mock_jwt_token_admin_piyush_001928374' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-avatar-large {
      width: 72px;
      height: 72px;
      border-radius: 20px;
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      color: #fff;
      font-size: 2rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35);
    }
    .token-box {
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid var(--border-glass);
      color: #a5b4fc;
    }
  `]
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  notifyService = inject(NotificationService);

  user: User | null = null;
  fullName = '';
  email = '';
  depositAmount: number = 50000;
  isSaving = false;

  ngOnInit(): void {
    this.user = this.authService.currentUser();
    if (this.user) {
      this.fullName = this.user.fullName;
      this.email = this.user.email;
    }
  }

  saveProfile(): void {
    this.isSaving = true;
    this.authService.updateProfile(this.fullName, this.email).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.user = this.authService.currentUser();
        this.notifyService.success('Profile Saved', 'Your account profile has been successfully updated.');
      },
      error: () => {
        this.isSaving = false;
        this.notifyService.error('Error', 'Failed to update profile.');
      }
    });
  }

  resetBalance(): void {
    this.authService.resetBalance().subscribe(() => {
      this.user = this.authService.currentUser();
      this.notifyService.success('Balance Reset', 'Virtual balance successfully reset to ₹10,00,000.00.');
    });
  }

  addFunds(): void {
    if (this.depositAmount > 0) {
      this.authService.addVirtualFunds(this.depositAmount).subscribe({
        next: (res) => {
          this.user = res.data || this.authService.currentUser();
          this.notifyService.success(
            "Funds Injected",
            `Added ₹${this.depositAmount.toLocaleString("en-IN")} virtual cash to your account.`,
          );
        },
        error: () => {
          this.notifyService.error("Error", "Failed to add funds.");
        },
      });
    }
  }
}
