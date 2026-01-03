import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'stockStatus',
    standalone: true
})
export class StockStatusPipe implements PipeTransform {
    transform(quantity: number | null | undefined): string {
        const q = Number(quantity ?? 0);

        if (q > 3) return 'In Stock';
        if (q >= 1) return 'Low Stock';
        return 'Out of Stock';
    }
}