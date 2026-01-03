import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormatDto } from '../models/format.dto';
import { GenreDto } from '../models/genre.dto';

@Injectable({ providedIn: 'root' })
export class LookupService {
    private readonly baseUrl = 'http://localhost:3000';

    constructor(private http: HttpClient) { }

    getFormats(): Observable<FormatDto[]> {
        return this.http.get<FormatDto[]>(`${this.baseUrl}/formats`);
    }

    getGenres(): Observable<GenreDto[]> {
        return this.http.get<GenreDto[]>(`${this.baseUrl}/genres`);
    }
}