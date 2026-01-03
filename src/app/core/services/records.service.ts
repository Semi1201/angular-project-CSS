import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecordDto } from '../models/record.dto';

@Injectable({ providedIn: 'root' })
export class RecordsService {
    private readonly baseUrl = 'http://localhost:3000';

    constructor(private http: HttpClient) { }

    getAll(): Observable<RecordDto[]> {
        return this.http.get<RecordDto[]>(`${this.baseUrl}/records`);
    }

    getById(id: number): Observable<RecordDto> {
        return this.http.get<RecordDto>(`${this.baseUrl}/records/${id}`);
    }

    add(record: Omit<RecordDto, 'id'>): Observable<RecordDto> {
        return this.http.post<RecordDto>(`${this.baseUrl}/records`, record);
    }

    update(id: number, record: RecordDto): Observable<RecordDto> {
        return this.http.put<RecordDto>(`${this.baseUrl}/records/${id}`, record);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/records/${id}`);
    }
}