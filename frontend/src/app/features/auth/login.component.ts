import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";
import { NotificationService } from "../../core/services/notification.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <main class="auth-page">
      <section class="auth-panel">
        <a routerLink="/dashboard" class="auth-brand"
          ><span class="brand-mark">P</span> PortfolioPro</a
        >
        <p class="eyebrow">PAPER TRADING WORKSPACE</p>
        <h1>Welcome back</h1>
        <p class="muted">Sign in to continue managing your portfolio.</p>
        <form (ngSubmit)="signIn()" #loginForm="ngForm">
          <label for="username">Username</label>
          <input
            id="username"
            name="username"
            [(ngModel)]="username"
            autocomplete="username"
            required
            placeholder="admin or trader"
          />
          <label for="password">Password</label>
          <input
            id="password"
            name="password"
            [(ngModel)]="password"
            type="password"
            autocomplete="current-password"
            required
            placeholder="Enter password (e.g. trader123)"
          />
          <p class="form-note">JWT-secured session with Spring Boot backend.</p>
          <button type="submit" class="btn-submit" [disabled]="loginForm.invalid || busy">
            {{ busy ? "Signing in…" : "Sign in" }}
          </button>

          <!-- 1-Click Demo Logins -->
          <div class="demo-logins-box mt-3">
            <span class="demo-label">1-CLICK DEMO ACCESS:</span>
            <div class="d-flex gap-2 mt-1">
              <button type="button" class="btn-demo-trader flex-fill" (click)="quickLogin('trader', 'trader123')" [disabled]="busy">
                <i class="fa-solid fa-bolt me-1"></i> Trader Demo
              </button>
              <button type="button" class="btn-demo-admin flex-fill" (click)="quickLogin('admin', 'admin123')" [disabled]="busy">
                <i class="fa-solid fa-shield-halved me-1"></i> Admin Demo
              </button>
            </div>
          </div>
        </form>
        <p class="auth-switch">
          New to PortfolioPro? <a routerLink="/register">Create an account</a>
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
        width: min(100%, 420px);
        padding: 36px;
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
        margin-bottom: 42px;
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
        letter-spacing: 0.08em;
      }
      h1 {
        margin: 8px 0;
        font-size: 1.8rem;
      }
      .muted,
      .form-note {
        color: #9ca3af;
        font-size: 0.88rem;
      }
      form {
        display: grid;
        gap: 10px;
        margin-top: 28px;
      }
      label {
        font-size: 0.8rem;
        font-weight: 700;
        margin-top: 8px;
      }
      input {
        width: 100%;
        min-height: 44px;
        padding: 10px 12px;
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
        margin: 2px 0 8px;
        font-size: 0.75rem;
      }
      .btn-submit {
        min-height: 44px;
        border: 0;
        border-radius: 7px;
        background: #10b981;
        color: #06291e;
        font-weight: 800;
        cursor: pointer;
        width: 100%;
        transition: all 0.2s;
      }
      .btn-submit:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
      .demo-logins-box {
        padding: 12px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
      }
      .demo-label {
        font: 700 0.65rem "JetBrains Mono", monospace;
        color: #9ca3af;
        letter-spacing: 0.05em;
        display: block;
      }
      .btn-demo-trader {
        padding: 8px 12px;
        border-radius: 6px;
        background: rgba(16, 185, 129, 0.15);
        border: 1px solid rgba(16, 185, 129, 0.4);
        color: #34d399;
        font-weight: 700;
        font-size: 0.78rem;
        cursor: pointer;
        transition: all 0.15s;
      }
      .btn-demo-trader:hover {
        background: rgba(16, 185, 129, 0.25);
      }
      .btn-demo-admin {
        padding: 8px 12px;
        border-radius: 6px;
        background: rgba(245, 158, 11, 0.15);
        border: 1px solid rgba(245, 158, 11, 0.4);
        color: #fbbf24;
        font-weight: 700;
        font-size: 0.78rem;
        cursor: pointer;
        transition: all 0.15s;
      }
      .btn-demo-admin:hover {
        background: rgba(245, 158, 11, 0.25);
      }
      .auth-switch {
        margin: 24px 0 0;
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
          padding: 26px 22px;
        }
      }
    `,
  ],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private notifyService = inject(NotificationService);
  username = "";
  password = "";
  busy = false;

  quickLogin(user: string, pass: string): void {
    this.username = user;
    this.password = pass;
    this.signIn();
  }

  signIn(): void {
    if (!this.username.trim() || !this.password) return;
    this.busy = true;
    this.authService
      .login({ username: this.username.trim(), password: this.password })
      .subscribe({
        next: (res) => {
          this.busy = false;
          this.notifyService.success("Welcome back", `Signed in as ${userTitle(this.username)}.`);
          void this.router.navigate(["/dashboard"]);
        },
        error: (err) => {
          this.busy = false;
          const msg =
            err?.error?.message ||
            "Invalid username or password. (Demo: trader / trader123 or admin / admin123)";
          this.notifyService.error("Sign In Failed", msg);
        },
      });
  }
}

function userTitle(username: string): string {
  return username === "admin" ? "Administrator" : "Trader";
}
