import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';

import { RecordsService } from '../../../core/services/records.service';
import { LookupService } from '../../../core/services/lookup.service';
import { RecordDto } from '../../../core/models/record.dto';
import { FormatDto } from '../../../core/models/format.dto';
import { GenreDto } from '../../../core/models/genre.dto';

@Component({
  selector: 'app-record-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './record-edit.html',
  styleUrl: './record-edit.css',
})
export class RecordEdit implements OnInit {
  id!: number;

  form!: FormGroup;
  record: RecordDto | null = null;

  formats: FormatDto[] = [];
  genres: GenreDto[] = [];

  loading = false;
  submitting = false;
  errorMsg = '';
  lastLoadedAt: Date | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private recordsService: RecordsService,
    private lookupService: LookupService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = Number(idParam);

    if (!this.id || Number.isNaN(this.id)) {
      this.errorMsg = 'Invalid record id.';
      return;
    }

    this.buildForm();
    this.loadLookupsAndRecord();
  }

  buildForm(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required]],
      artist: ['', [Validators.required]],
      format: ['', [Validators.required]],
      genre: ['', [Validators.required]],
      releaseYear: ['', [Validators.required]],
      price: ['', [Validators.required]],
      stockQuantity: ['', [Validators.required]],

      customerId: ['', [Validators.required, Validators.pattern(/^\d+[A-Za-z]$/)]],
      customerFirstName: ['', [Validators.required]],
      customerLastName: ['', [Validators.required]],
      customerContactNumber: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^\d+$/)]],
      customerEmail: ['', [Validators.required, Validators.email]],
    });
  }

  isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  loadLookupsAndRecord(): void {
    this.loading = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    // Load formats
    this.lookupService.getFormats().pipe(
      catchError(err => {
        console.error('formats error', err);
        this.errorMsg = 'Failed to load formats/genres.';
        return of([] as FormatDto[]);
      })
    ).subscribe(data => {
      this.formats = data;
      this.cdr.detectChanges();
    });

    // Load genres
    this.lookupService.getGenres().pipe(
      catchError(err => {
        console.error('genres error', err);
        this.errorMsg = 'Failed to load formats/genres.';
        return of([] as GenreDto[]);
      })
    ).subscribe(data => {
      this.genres = data;
      this.cdr.detectChanges();
    });

    // Load record & prefill form
    this.recordsService.getById(this.id).pipe(
      catchError(err => {
        console.error('record load error', err);
        this.errorMsg = 'Failed to load record for editing.';
        return of(null);
      }),
      finalize(() => {
        this.loading = false;
        this.lastLoadedAt = new Date();
        this.cdr.detectChanges();
      })
    ).subscribe(rec => {
      this.record = rec;

      if (this.record) {
        this.form.patchValue({
          title: this.record.title,
          artist: this.record.artist,
          format: this.record.format,
          genre: this.record.genre,
          releaseYear: this.record.releaseYear,
          price: this.record.price,
          stockQuantity: this.record.stockQuantity,

          customerId: this.record.customerId,
          customerFirstName: this.record.customerFirstName,
          customerLastName: this.record.customerLastName,
          customerContactNumber: this.record.customerContactNumber,
          customerEmail: this.record.customerEmail,
        });
      }

      this.cdr.detectChanges();
    });
  }

  reload(): void {
    this.loadLookupsAndRecord();
  }

  cancel(): void {
    this.router.navigate(['/records', this.id]);
  }

  submit(): void {
    this.errorMsg = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    this.submitting = true;
    this.cdr.detectChanges();

    const payload: RecordDto = {
      id: this.id,
      title: this.form.get('title')!.value,
      artist: this.form.get('artist')!.value,
      format: this.form.get('format')!.value,
      genre: this.form.get('genre')!.value,
      releaseYear: Number(this.form.get('releaseYear')!.value),
      price: Number(this.form.get('price')!.value),
      stockQuantity: Number(this.form.get('stockQuantity')!.value),

      customerId: this.form.get('customerId')!.value,
      customerFirstName: this.form.get('customerFirstName')!.value,
      customerLastName: this.form.get('customerLastName')!.value,
      customerContactNumber: this.form.get('customerContactNumber')!.value,
      customerEmail: this.form.get('customerEmail')!.value,
    };

    this.recordsService.update(this.id, payload).pipe(
      catchError(err => {
        console.error('update error', err);
        this.errorMsg = 'Failed to update record.';
        return of(null);
      }),
      finalize(() => {
        this.submitting = false;
        this.cdr.detectChanges();
      })
    ).subscribe(updated => {
      if (!updated) return;
      this.router.navigate(['/records', this.id]);
    });
  }
}