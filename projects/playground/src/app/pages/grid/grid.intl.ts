import { Injectable } from '@angular/core';
import { UiGridIntl } from '@uipath/angular/components/ui-grid';

@Injectable()
export class UiGridTable extends UiGridIntl {
    public noDataMessageAlternative = (searchValue?: string, activeFilters?: number | null) => {
        if (searchValue && activeFilters) {
            return `No results with current filters applied for: ${searchValue}`;
        }
        if (searchValue) {
            return `No results for: ${searchValue}`;
        }
        if (activeFilters) {
            return `No results to display with current filters applied`;
        }

        return 'No results to display';
    }
}
