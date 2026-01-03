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
          this.cdr.detectChanges();
        })
      )
      .subscribe((data) => {
        this.records = data;
        this.cdr.detectChanges();
      });
  }

  // permissions
  get canUpdate(): boolean {
    const role = this.auth.getRole();
    return role === 'Store Manager' || role === 'System Admin';
  }

  get canDelete(): boolean {
    return this.auth.getRole() === 'System Admin';
  }

  deletingId: number | null = null;

  deleteRecord(id: number): void {
    if (!this.canDelete) return;

    const confirmed = window.confirm('Are you sure you want to delete this record?');
    if (!confirmed) return;

    this.deletingId = id;
    this.errorMsg = '';
    this.cdr.detectChanges();

    this.recordsService.delete(id)
      .pipe(
        catchError(err => {
          console.error('delete error', err);
          this.errorMsg = 'Failed to delete record.';
          return of(null);
        }),
        finalize(() => {
          this.deletingId = null;
          this.cdr.detectChanges();
        })
      )
      .subscribe(() => {
        this.loadRecords();
      });
  }


  view(id: number) { this.router.navigate(['/records', id]); }
  edit(id: number) { this.router.navigate(['/records', id, 'edit']); }
}