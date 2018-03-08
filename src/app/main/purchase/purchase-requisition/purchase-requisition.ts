export class PurchaseRequisition {
  code?: string = 'N/A';
  name?: string | null | undefined;
  document_date?: number | null | undefined = new Date().getTime();
  delivery_date?: number | null | undefined = new Date().getTime();
  type?: string = '';
  group?: string = '';
  subgroup?: string = '';
  user_request?: string | null | undefined;
  remark?: string | null | undefined;
  status?: string = 'pending';
  disable?: boolean = false;
  item?: PurchaseRequisitionItem[] = [];

  constructor(params: PurchaseRequisition) {
    Object.assign(this, params);
  }
}

export class PurchaseRequisitionItem {
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
  quantity?: number = 0;

  constructor(params: PurchaseRequisitionItem) {
    Object.assign(this, params);
  }
}
