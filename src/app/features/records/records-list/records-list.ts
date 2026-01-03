import { Component, OnInit } from '@angular/core';
import { RecordsService } from '../../../core/services/records.service';

@Component({
  selector: 'app-records-list',
  imports: [],
  templateUrl: './records-list.html',
  styleUrl: './records-list.css',
})
export class RecordsList implements OnInit {
  constructor(private recordsService: RecordsService) { }

  ngOnInit(): void {
    this.recordsService.getAll().subscribe({
      next: (data) => console.log('Records from API:', data),
      error: (err) => console.error('API error:', err)
    });
  }
}