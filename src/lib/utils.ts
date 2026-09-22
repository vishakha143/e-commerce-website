export { cn } from "cn";

/**
 * JSON.stringify doesn't escape `/`, so a string field containing the
 * literal "</script>" would close a `<script>` tag early when injected
 * via dangerouslySetInnerHTML — escaping `<` prevents that without
 * altering the JSON.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
