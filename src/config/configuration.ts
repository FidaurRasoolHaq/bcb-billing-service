/**
 * Typed config shape consumed via `ConfigService.get<AppConfig>('app')`.
 * Keeping this as a single factory (rather than reading `process.env`
 * ad-hoc across the codebase) means there is exactly one place that knows
 * how env vars map to runtime config.
 */
export interface AppConfig {
  port: number;
  nodeEnv: string;
  billing: {
    transactionFeeGbp: number;
  };
}

export default (): { app: AppConfig } => ({
  app: {
    port: parseInt(process.env.PORT ?? '3000', 10),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    billing: {
      transactionFeeGbp: parseFloat(process.env.TRANSACTION_FEE_GBP ?? '0.2'),
    },
  },
});
