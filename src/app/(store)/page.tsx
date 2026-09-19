import { Hero } from "@/components/home/Hero";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { TrendingProducts } from "@/components/home/TrendingProducts";
import { NewArrivals } from "@/components/home/NewArrivals";
import { ShopTheLook } from "@/components/home/ShopTheLook";
import { TrustSection } from "@/components/home/TrustSection";

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
