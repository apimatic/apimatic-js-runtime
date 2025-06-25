import { PaginationStrategy } from '../paginationStrategy';
import { RequestBuilder } from '../core';
import { NumberPagedResponse } from './numberPagedResponse';
import { PagedResponse } from '../pagedResponse';

export class PagePagination implements PaginationStrategy {
  private readonly pagePointer: string;
  private pageNumber: string = '1';

  constructor(pagePointer: string) {
    this.pagePointer = pagePointer;
  }

  public isApplicable(
    request: RequestBuilder<any, any>,
    response: PagedResponse<any, any> | null
  ): boolean {
    let isUpdated: boolean = false;
    request.updateParameterByJsonPointer(this.pagePointer, (value) => {
      if (response === null) {
        isUpdated = true;
        if (value === undefined || value === null) {
          this.pageNumber = '1';
          return value;
        }
        this.pageNumber = String(value);
        return value;
      }
      const numericValue = +(value ?? 1);
      const newPage = numericValue + 1;
      this.pageNumber = newPage.toString();
      isUpdated = true;
      return newPage;
    });
    return isUpdated;
  }

  public withMetadata<TItem, TPage>(
    response: PagedResponse<TItem, TPage>
  ): NumberPagedResponse<TItem, TPage> {
    return {
      ...response,
      pageNumber: this.pageNumber,
    };
  }
}
