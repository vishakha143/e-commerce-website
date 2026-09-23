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

/**
 * Escapes regex metacharacters so a value can be dropped into a `new
 * RegExp()` pattern as a literal string. Without this, a filter value
 * built from user input (e.g. ?brand=...) lets an attacker inject
 * arbitrary regex — at minimum a ReDoS vector via a pattern like
 * `(a+)+$`, and in general undefined matching behavior.
 */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
