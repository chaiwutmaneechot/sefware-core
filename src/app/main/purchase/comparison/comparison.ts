export class Comparison {
  code?: string = 'N/A';
  name?: string | null | undefined;
  supplier?: string | null | undefined;
  type?: string = '';
  group?: string = '';
  subgroup?: string = '';
  period_from?: string | null | undefined;
  period_to?: string | null | undefined;
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
  primary_unit?: string | null | undefined;
  primary_unit_name?: string | null | undefined;
  disable?: boolean = false;
  price?: number = 0;

  constructor(params: ComparisonItem) {
    Object.assign(this, params);
  }
}
