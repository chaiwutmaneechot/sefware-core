export class Comparison {
  code?: string = 'N/A';
  name?: string | null | undefined;
  supplier?: string | null | undefined;
  supplier_name1?: string | null | undefined;
  supplier_name2?: string | null | undefined;
  type?: string = '';
  type_name?: string = '';
  group?: string = '';
  subgroup?: string = '';
  period_from?: number | null | undefined = new Date().getTime();
  period_to?: number | null | undefined = new Date().getTime();
  remark?: string | null | undefined;
  disable?: boolean = false;
  item?: ComparisonItem[] = [];

  constructor(params: Comparison) {
    Object.assign(this, params);
  }
}

export class ComparisonItem {
  code?: string = 'N/A';
  type_code?: string | null | undefined;
  group_code?: string | null | undefined;
  subgroup_code?: string | null | undefined;
  name1?: string | null | undefined;
  name2?: string | null | undefined;
  unit?: string | null | undefined;
  primary_unit?: string | null | undefined;
  primary_unit_name?: string | null | undefined;
  secondary_unit?: string | null | undefined;
  secondary_unit_name?: string | null | undefined;
  disable?: boolean = false;
  price?: number = 0;

  constructor(params: ComparisonItem) {
    Object.assign(this, params);
  }
}
