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
