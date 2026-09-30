import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";
import { NotificationService } from "../../core/services/notification.service";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <main class="auth-page">
      <section class="auth-panel">
        <a routerLink="/dashboard" class="auth-brand"
          ><span class="brand-mark">P</span> PortfolioPro</a
        >
        <p class="eyebrow">START WITH VIRTUAL CAPITAL</p>
        <h1>Create your account</h1>
        <p class="muted">
          A paper-trading profile with ₹10,00,000 in virtual funds.
        </p>
        <form (ngSubmit)="register()" #registerForm="ngForm">
          <label for="fullName">Full name</label>
          <input
            id="fullName"
            name="fullName"
            [(ngModel)]="fullName"
            autocomplete="name"
            required
            placeholder="e.g. Piyush Singh"
          />
          <label for="username">Username</label>
          <input
            id="username"
            name="username"
            [(ngModel)]="username"
            autocomplete="username"
            required
            minlength="3"
            placeholder="e.g. trader_pro"
          />
          <label for="email">Email</label>
          <input
            id="email"
            name="email"
            [(ngModel)]="email"
            type="email"
            autocomplete="email"
            required
            placeholder="e.g. trader@example.com"
          />
          <label for="password">Password</label>
          <input
            id="password"
            name="password"
            [(ngModel)]="password"
            type="password"
            autocomplete="new-password"
            required
            minlength="6"
            placeholder="At least 6 characters"
          />
          <p class="form-note">
            Account is created with ₹10,00,000 default virtual cash.
          </p>
          <button type="submit" [disabled]="registerForm.invalid || busy">
            {{ busy ? "Creating…" : "Create account" }}
          </button>
        </form>
        <p class="auth-switch">
          Already registered? <a routerLink="/login">Sign in</a>
        </p>
      </section>
    </main>
  `,
  styles: [
    `
      .auth-page {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        background:
          radial-gradient(
            ellipse at 15% 10%,
            rgba(16, 185, 129, 0.17),
            transparent 38%
          ),
          linear-gradient(145deg, #09131a, #111827 70%, #182a2c);
        color: #f8fafc;
      }
      .auth-panel {
        width: min(100%, 440px);
        padding: 34px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 12px;
        background: rgba(13, 23, 30, 0.9);
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.28);
      }
      .auth-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        color: inherit;
        text-decoration: none;
        font-weight: 800;
        font-size: 1.1rem;
        margin-bottom: 34px;
      }
      .brand-mark {
        display: grid;
        place-items: center;
        width: 34px;
        height: 34px;
        color: #052e24;
        background: #34d399;
        border-radius: 8px;
      }
      .eyebrow {
        color: #34d399;
        font:
          700 0.7rem "JetBrains Mono",
          monospace;
      }
      h1 {
        margin: 8px 0;
        font-size: 1.8rem;
      }
      .muted,
      .form-note {
        color: #9ca3af;
        font-size: 0.86rem;
      }
      form {
        display: grid;
        gap: 8px;
        margin-top: 22px;
      }
      label {
        font-size: 0.8rem;
        font-weight: 700;
        margin-top: 6px;
      }
      input {
        width: 100%;
        min-height: 42px;
        padding: 9px 12px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 7px;
        background: #0c151b;
        color: #f8fafc;
      }
      input:focus {
        outline: 2px solid #34d399;
        border-color: transparent;
      }
      .form-note {
        margin: 4px 0;
        font-size: 0.75rem;
      }
      button {
        min-height: 44px;
        border: 0;
        border-radius: 7px;
        background: #10b981;
        color: #06291e;
        font-weight: 800;
        cursor: pointer;
      }
      button:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
      .auth-switch {
        margin: 22px 0 0;
        text-align: center;
        color: #9ca3af;
        font-size: 0.84rem;
      }
      .auth-switch a {
        color: #6ee7b7;
        font-weight: 700;
      }
      @media (max-width: 480px) {
        .auth-panel {
          padding: 24px 20px;
        }
      }
    `,
  ],
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private notifyService = inject(NotificationService);
  fullName = "";
  username = "";
  email = "";
  password = "";
  busy = false;

  register(): void {
    if (
      !this.fullName.trim() ||
      !this.username.trim() ||
      !this.email.trim() ||
      this.password.length < 6
    )
      return;
    this.busy = true;
    this.authService
      .register({
        fullName: this.fullName.trim(),
        username: this.username.trim(),
        email: this.email.trim(),
        password: this.password,
      })
      .subscribe({
        next: (res) => {
          this.busy = false;
          this.notifyService.success(
            "Registration Successful",
            `Account created with ₹10,00,000 virtual balance.`,
          );
          void this.router.navigate(["/dashboard"]);
        },
        error: (err) => {
          this.busy = false;
          const msg =
            err?.error?.message ||
            "Could not create account. Username or email may already be in use.";
          this.notifyService.error("Registration Failed", msg);
        },
      });
  }
}
