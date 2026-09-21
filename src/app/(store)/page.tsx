import { Hero } from "@/components/home/Hero";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { TrendingProducts } from "@/components/home/TrendingProducts";
import { NewArrivals } from "@/components/home/NewArrivals";
import { ShopTheLook } from "@/components/home/ShopTheLook";
import { TrustSection } from "@/components/home/TrustSection";

// Trending/New Arrivals pull from the DB; without this the page would be
// frozen at build time and admin product changes wouldn't show until redeploy.
export const revalidate = 60;

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryShowcase />
      <TrendingProducts />
      <ShopTheLook />
      <NewArrivals />
      <TrustSection />
    </>
  );
}
