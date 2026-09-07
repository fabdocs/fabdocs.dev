// One free-tier pool and one subscriber pool for the Ask AI assistant.
// Centralised so the API route and the client widget agree on the exact
// numbers and the exact limit-message strings (the client matches the
// string to render the upgrade prompt).

export const AI_ROUTE_KEY = 'chat';
export const AI_ROUTE_KEY_SUB = 'chat-sub';

// The whole free allowance. Deliberately tight — enough to try the
// assistant and get value from a real question or two per day, not enough
// to replace a subscription.
export const AI_FREE_LIMIT = 5;

// Generous but bounded: caps worst-case Anthropic spend from a leaked or
// shared cookie, and from the fail-open path during a KV outage. Far above
// any real single subscriber's daily use.
export const AI_SUBSCRIBER_LIMIT = 200;

export const AI_WINDOW_SECONDS = 60 * 60 * 24;

export const AI_FREE_LIMIT_MESSAGE =
  "You've used today's free AI questions on fabdocs.dev. Upgrade to Pro for 200/day, or come back tomorrow.";
export const AI_SUBSCRIBER_LIMIT_MESSAGE =
  "That's an unusually high number of questions in one day — try again shortly.";
