export class GoodsReceive {
  code?: string = 'N/A';
  name?: string | null | undefined;
  name_eng?: string | null | undefined;
  detail?: string | null | undefined;
  disable?: boolean = false;

  constructor(params: GoodsReceive) {
    Object.assign(this, params);
  }
}
