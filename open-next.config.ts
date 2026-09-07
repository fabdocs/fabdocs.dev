import { defineCloudflareConfig } from '@opennextjs/cloudflare';

/**
 * OpenNext adapter config for Cloudflare Workers.
 *
 * Incremental cache is left on the default (in-worker) for now. To enable
 * persistent ISR/data caching later, add an R2 or KV binding here and wire
 * `incrementalCache` — see https://opennext.js.org/cloudflare/caching
 */
export default defineCloudflareConfig();
