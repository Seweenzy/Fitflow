type LogContext = Record<string, boolean | number | string | undefined>;

// Keep operational logs structured and free of credentials or personal data.
export function logOperationalEvent(event: string, context: LogContext = {}) {
  if (__DEV__) {
    console.warn(`[FitFlow] ${event}`, context);
  }
}

export function reportOperationalError(
  event: string,
  error: unknown,
  context: LogContext = {},
) {
  logOperationalEvent(event, {
    ...context,
    error: error instanceof Error ? error.message : 'Unknown error',
  });
  // Connect this boundary to the production crash/error provider before release.
}
