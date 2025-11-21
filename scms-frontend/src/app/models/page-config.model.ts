/**
 * ページング情報
 */
export interface PagingConfig {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  maxPageLinks: number;
}

export interface PagingList<T> {
  data: T[];
  pagingConfig: PagingConfig;
}
