import { ComparisonItem } from './comparison';

export class ItemWithCompare {
  code?: string = 'N/A';
  name1?: string | null | undefined;
  name2?: string | null | undefined;
  supplier?: string | null | undefined;
  supplier_name1?: string | null | undefined;
  supplier_name2?: string | null | undefined;
  unit?: string | null | undefined;
  unit_name?: string | null | undefined;
  disable?: boolean = false;
  price?: number = 0;
  list_supplier?: ListSupplier[] = [];

  constructor(params: ItemWithCompare) {
    Object.assign(this, params);
  }
}

export class ListSupplier {
  code?: string = 'N/A';
  name1?: string | null | undefined;
  name2?: string | null | undefined;
  price?: number = 0;
  unit?: string | null | undefined;

  constructor(params: ListSupplier) {
    Object.assign(this, params);
  }
}
