import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';

import { RecordsService } from '../../../core/services/records.service';
import { AuthService } from '../../../core/services/auth.service';
import { RecordDto } from '../../../core/models/record.dto';

import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx-js-style';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


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

  private genreColor(genre: string): string {
    const g = (genre || '').toLowerCase();

    if (g.includes('rock')) return '#fa0d0dff';
    if (g.includes('pop')) return '#c624dcff';
    if (g.includes('jazz')) return '#0d722bff';

    return '#ffffff';
  }

  exportExcel(): void {
    const rows = this.records.map(r => ({
      Id: r.id ?? '',
      CustomerId: r.customerId ?? '',
      CustomerLastName: r.customerLastName ?? '',
      Format: r.format ?? '',
      Genre: r.genre ?? '',
      Title: r.title ?? '',
      Artist: r.artist ?? '',
      ReleaseYear: r.releaseYear ?? '',
      Price: r.price ?? '',
      StockQuantity: r.stockQuantity ?? ''
    }));

    const ws = XLSX.utils.json_to_sheet(rows);

    const range = XLSX.utils.decode_range(ws['!ref']!);

    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      const genreCellAddr = XLSX.utils.encode_cell({ r: row, c: 4 });
      const genreValue = (ws[genreCellAddr]?.v ?? '').toString();
      const hex = this.genreColor(genreValue);

      const argb = 'FF' + hex.replace('#', '').toUpperCase();

      for (let col = range.s.c; col <= range.e.c; col++) {
        const addr = XLSX.utils.encode_cell({ r: row, c: col });
        if (!ws[addr]) continue;

        ws[addr].s = {
          fill: {
            patternType: 'solid',
            fgColor: { argb }
          }
        };
      }
    }

    for (let col = range.s.c; col <= range.e.c; col++) {
      const addr = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[addr]) continue;
      ws[addr].s = {
        font: { bold: true },
        fill: { patternType: 'solid', fgColor: { argb: 'FF222222' } },
        alignment: { horizontal: 'center' }
      };
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Records');

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    saveAs(blob, 'records.xlsx');
  }

  exportPdf(): void {
    const doc = new jsPDF();

    doc.text('Records Export', 14, 12);

    const head = [[
      'Id', 'CustomerId', 'CustomerLastName', 'Format', 'Genre', 'Title', 'Artist', 'Year', 'Price', 'Stock'
    ]];

    const body = this.records.map(r => ([
      r.id ?? '',
      r.customerId ?? '',
      r.customerLastName ?? '',
      r.format ?? '',
      r.genre ?? '',
      r.title ?? '',
      r.artist ?? '',
      r.releaseYear ?? '',
      r.price ?? '',
      r.stockQuantity ?? ''
    ]));

    autoTable(doc, {
      head,
      body,
      startY: 18,
      didParseCell: (data) => {
        if (data.section === 'head') {
          data.cell.styles.fillColor = [34, 34, 34];
          data.cell.styles.textColor = 255;
          return;
        }

        if (data.section === 'body') {
          const rowIndex = data.row.index;
          const genre = (this.records[rowIndex]?.genre ?? '').toString();
          const hex = this.genreColor(genre);

          const rgb = hex.replace('#', '');
          const r = parseInt(rgb.substring(0, 2), 16);
          const g = parseInt(rgb.substring(2, 4), 16);
          const b = parseInt(rgb.substring(4, 6), 16);

          data.cell.styles.fillColor = [r, g, b];
        }
      }
    });

    doc.save('records.pdf');
  }

  view(id: number) { this.router.navigate(['/records', id]); }
  edit(id: number) { this.router.navigate(['/records', id, 'edit']); }
}