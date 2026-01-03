import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';

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
  loading = false;
  errorMsg = '';
  lastLoadedAt: Date | null = null;

  constructor(
    private recordsService: RecordsService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadRecords();
  }

  loadRecords(): void {
    this.loading = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    this.recordsService.getAll()
      .pipe(
        catchError((err) => {
          console.error('API error:', err);
          this.errorMsg = 'Failed to load records. Please click Reload.';
          return of([] as RecordDto[]);
        }),
        finalize(() => {
          this.loading = false;
          this.lastLoadedAt = new Date();
          this.cdr.detectChanges();
        })
      )
      .subscribe((data) => {
        this.records = data;
        this.cdr.detectChanges();
      });
  }

  reload(): void {
    this.loadRecords();
  }

  // permissions
  get canUpdate(): boolean {
    const role = this.auth.getRole();
    return role === 'Store Manager' || role === 'System Admin';
  }

  get canDelete(): boolean {
    return this.auth.getRole() === 'System Admin';
  }

  view(id: number) { this.router.navigate(['/records', id]); }
  edit(id: number) { this.router.navigate(['/records', id, 'edit']); }
}