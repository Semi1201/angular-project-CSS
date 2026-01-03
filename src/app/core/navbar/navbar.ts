import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.dto';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
})
export class Navbar {
  isLoggedIn = false;
  role: UserRole | '' = '';

  constructor(private router: Router, private auth: AuthService) {
    this.auth.user$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.role = user?.role ?? '';
    });
  }

  get canAdd(): boolean {
    return this.isLoggedIn && (this.role === 'Salesperson' || this.role === 'Store Manager' || this.role === 'System Admin');
  }

  get loginButtonText(): string {
    return this.isLoggedIn ? 'Logout' : 'Login';
  }

  onLoginOrLogout() {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  goRecords() { this.router.navigate(['/records']); }
  goAdd() { this.router.navigate(['/records/add']); }
}