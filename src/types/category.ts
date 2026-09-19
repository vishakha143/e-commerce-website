export interface CategoryNode {
  name: string;
  slug: string;
  children?: CategoryNode[];
}
