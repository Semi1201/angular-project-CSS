import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';


import { RecordsService } from '../../../core/services/records.service';
import { RecordDto } from '../../../core/models/record.dto';
import { StockStatusPipe } from './../../shared/pipes/stock-status.pipe';

@Component({
  selector: 'app-record-details',
  standalone: true,
  imports: [CommonModule, StockStatusPipe],
  templateUrl: './record-details.html',
  styleUrl: './record-details.css',
})
export class RecordDetails implements OnInit {
  id!: number;

  record: RecordDto | null = null;
  loading = false;
  errorMsg = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recordsService: RecordsService,
    private cdr: ChangeDetectorRef
  ) { }


  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = Number(idParam);

    if (!this.id || Number.isNaN(this.id)) {
      this.errorMsg = 'Invalid record id.';
      return;
    }

    this.loadRecord();
  }

  loadRecord(): void {
    this.loading = true;
    this.errorMsg = '';

    this.recordsService.getById(this.id)
      .pipe(
        catchError(err => {
          console.error('Record details error:', err);
          this.errorMsg = 'Failed to load record details. Please click Reload.';
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(data => {
        this.record = data;
        this.cdr.detectChanges();
      });
  }

  back(): void {
    this.router.navigate(['/records']);
  }
}