
// Logging utilities for consistent log formatting
import { LOG_PREFIX } from "./constants.ts";

/**
 * Create a timestamped log message
 */
export const createLogMessage = (timestamp: string, message: string): string => {
  return `[${timestamp}] ${message}`;
};

/**
 * Log an info message with timestamp
 */
export const logInfo = (timestamp: string, message: string): void => {
  console.log(`${LOG_PREFIX.INFO} ${createLogMessage(timestamp, message)}`);
};

/**
 * Log a warning message with timestamp
 */
export const logWarning = (timestamp: string, message: string): void => {
  console.warn(`${LOG_PREFIX.WARNING} ${createLogMessage(timestamp, message)}`);
};

/**
 * Log an error message with timestamp
 */
export const logError = (timestamp: string, message: string): void => {
  console.error(`${LOG_PREFIX.ERROR} ${createLogMessage(timestamp, message)}`);
};

/**
 * Log a debug message with timestamp
 */
export const logDebug = (timestamp: string, message: string): void => {
  console.log(`${LOG_PREFIX.DEBUG} ${createLogMessage(timestamp, message)}`);
};

/**
 * Log a process message with timestamp
 */
export const logProcess = (timestamp: string, message: string): void => {
  console.log(`${LOG_PREFIX.PROCESS} ${createLogMessage(timestamp, message)}`);
};

/**
 * Log an inspection message with timestamp
 */
export const logInspect = (timestamp: string, message: string): void => {
  console.log(`${LOG_PREFIX.INSPECT} ${createLogMessage(timestamp, message)}`);
};

/**
 * Log a key/security message with timestamp
 */
export const logSecurity = (timestamp: string, message: string): void => {
  console.log(`${LOG_PREFIX.SECURITY} ${createLogMessage(timestamp, message)}`);
};

/**
 * Log a payment message with timestamp
 */
export const logPayment = (timestamp: string, message: string): void => {
  console.log(`${LOG_PREFIX.PAYMENT} ${createLogMessage(timestamp, message)}`);
};
