import { PaginationStrategy } from './paginationStrategy';
import { RequestBuilder } from '../http/requestBuilder';
import { NumberPagedResponse } from './numberPagedResponse';
import { PagedResponse } from './pagedResponse';

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
          return 1;
        }
        this.pageNumber = value;
        return value;
      }
      const numericValue = +(value ?? 0);
      const newPage = numericValue + 1;
      this.pageNumber = newPage.toString();
      isUpdated = true;
      return newPage;
    });
    return isUpdated;
  }

  public withMetadata<I, P>(
    response: PagedResponse<I, P>
  ): NumberPagedResponse<I, P> {
    return {
      ...response,
      pageNumber: this.pageNumber,
    };
  }
}
