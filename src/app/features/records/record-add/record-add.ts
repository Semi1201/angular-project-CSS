import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';

import { RecordsService } from '../../../core/services/records.service';
import { LookupService } from '../../../core/services/lookup.service';
import { FormatDto } from '../../../core/models/format.dto';
import { GenreDto } from '../../../core/models/genre.dto';
import { RecordDto } from '../../../core/models/record.dto';

@Component({
  selector: 'app-record-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './record-add.html',
  styleUrl: './record-add.css',
})
export class RecordAdd implements OnInit {
  form!: FormGroup;

  formats: FormatDto[] = [];
  genres: GenreDto[] = [];

  loadingLookups = false;
  submitting = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private lookupService: LookupService,
    private recordsService: RecordsService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required]],
      artist: ['', [Validators.required]],
      format: ['', [Validators.required]],
      genre: ['', [Validators.required]],
      releaseYear: ['', [Validators.required]],
      price: ['', [Validators.required]],
      stockQuantity: ['', [Validators.required]],

      customerId: ['', [
        Validators.required,
        Validators.pattern(/^\d+[A-Za-z]$/)
      ]],
      customerFirstName: ['', [Validators.required]],
      customerLastName: ['', [Validators.required]],
      customerContactNumber: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^\d+$/) //num only
      ]],
      customerEmail: ['', [Validators.required, Validators.email]],
    });

    this.loadLookups();
  }

  loadLookups(): void {
    this.loadingLookups = true;
    this.errorMsg = '';

    // load formats
    this.lookupService.getFormats()
      .pipe(
        catchError(err => {
          console.error('formats error', err);
          this.errorMsg = 'Failed to load formats/genres.';
          return of([] as FormatDto[]);
        }),
        finalize(() => {
        })
      )
      .subscribe(formats => {
        this.formats = formats;
        this.cdr.detectChanges();
      });

    // load genres
    this.lookupService.getGenres()
      .pipe(
        catchError(err => {
          console.error('genres error', err);
          this.errorMsg = 'Failed to load formats/genres.';
          return of([] as GenreDto[]);
        }),
        finalize(() => {
          this.loadingLookups = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(genres => {
        this.genres = genres;
        this.cdr.detectChanges();
      });
  }

  // helper for template
  isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  submit(): void {
    this.errorMsg = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    const contact = this.form.get('customerContactNumber')?.value as string;
    if (Number(contact) < 0) {
      this.errorMsg = 'Contact number must be non-negative.';
      return;
    }

    this.submitting = true;
    this.cdr.detectChanges();

    const payload: Omit<RecordDto, 'id'> = {
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

    this.recordsService.add(payload)
      .pipe(
        catchError(err => {
          console.error('add error', err);
          this.errorMsg = 'Failed to add record.';
          return of(null);
        }),
        finalize(() => {
          this.submitting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(result => {
        if (!result) return;
        this.router.navigate(['/records']);
      });
  }

  back(): void {
    this.router.navigate(['/records']);
  }
}