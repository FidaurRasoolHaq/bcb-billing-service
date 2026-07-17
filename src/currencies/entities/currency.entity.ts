export class Currency {
  code: string;
  monthlyFeeGbp: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: {
    code: string;
    monthlyFeeGbp: number;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.code = props.code;
    this.monthlyFeeGbp = props.monthlyFeeGbp;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? this.createdAt;
  }

  static normalizeCode(code: string): string {
    return code.trim().toUpperCase();
  }
}
