
// Constants used throughout the webhook handler

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

// Supported webhook event types
export const SUPPORTED_WEBHOOK_EVENTS = [
  'checkout.session.completed',
  'payment_intent.succeeded',
];

// Logging prefixes for better log readability
export const LOG_PREFIX = {
  INFO: '✅',
  ERROR: '❌',
  WARNING: '⚠️',
  DEBUG: '📝',
  PROCESS: '🔄',
  INSPECT: '🔍',
  SECURITY: '🔑',
  PAYMENT: '💰',
};

