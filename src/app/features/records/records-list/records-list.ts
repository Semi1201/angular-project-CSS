import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { RecordsService } from '../../../core/services/records.service';
import { AuthService } from '../../../core/services/auth.service';
import { RecordDto } from '../../../core/models/record.dto';

@Component({
  selector: 'app-records-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './records-list.html',
  styleUrl: './records-list.css',
})
export class RecordsList implements OnInit {
  records: RecordDto[] = [];
  loading = true;
  errorMsg = '';

  constructor(
    private recordsService: RecordsService,
    private auth: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.recordsService.getAll().subscribe({
      next: (data) => {
        this.records = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('API error:', err);
        this.errorMsg = 'Failed to load records.';
        this.loading = false;
      }
    });
  }

  get canUpdate(): boolean {
    const role = this.auth.getRole();
    return role === 'Store Manager' || role === 'System Admin';
  }

  get canDelete(): boolean {
    return this.auth.getRole() === 'System Admin';
  }

  view(id: number) {
    this.router.navigate(['/records', id]);
  }

  edit(id: number) {
    this.router.navigate(['/records', id, 'edit']);
  }

  // delete() add later <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
}