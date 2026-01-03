import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html',
})
export class Navbar {
  //temp
  isLoggedIn = false;
  role: 'Salesperson' | 'Store Manager' | 'System Admin' | '' = '';

  constructor(private router: Router) { }

  get canAdd(): boolean {
    return this.isLoggedIn && (this.role === 'Salesperson' || this.role === 'Store Manager' || this.role === 'System Admin');
  }

  get loginButtonText(): string {
    if (!this.isLoggedIn) return 'Login';
    return 'Logout';
  }

  goLogin() {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
    } else {
      //Note to self: implement logout<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
      this.isLoggedIn = false;
      this.role = '';
      this.router.navigate(['/login']);
    }
  }

  goRecords() {
    this.router.navigate(['/records']);
  }

  goAdd() {
    this.router.navigate(['/records/add']);
  }
}