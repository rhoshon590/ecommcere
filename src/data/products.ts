export type Product = {
  id: string;
  name: string;
  category: "Mug" | "Plate";
  price: number;
  tagline: string;
  image: string;
  gallery?: string[];
  description?: string;
  dimensions?: string;
  care?: string;
};

// Curated images from Unsplash — artisanal ceramic stoneware
export const PRODUCTS: Product[] = [
  {
    id: "kiln-01",
    name: "Kiln Mug",
    category: "Mug",
    price: 38,
    tagline: "Hand-thrown, matte ash glaze",
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556760544-74068565f05c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1481833761820-0509d3217039?auto=format&fit=crop&w=1200&q=80",
    ],
    description:
      "Our signature mug, thrown one at a time on the wheel and finished in a soft matte ash glaze. The slightly tapered form sits warmly in the hand, with a generous handle shaped for a full grip.",
    dimensions: "Holds 12 oz · 3.6″ tall · 3.2″ wide",
    care: "Dishwasher and microwave safe. Hand-washing preserves the glaze.",
  },
  {
    id: "linen-02",
    name: "Linen Dinner Plate",
    category: "Plate",
    price: 54,
    tagline: "Soft ivory with raw rim",
    image:
      "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=1200&q=80",
    ],
    description:
      "A weekday dinner plate with a soft ivory glaze that pools gently toward the center. The unglazed rim shows the raw stoneware — a quiet reminder of the clay it began as.",
    dimensions: "10.5″ diameter · 0.6″ rim",
    care: "Dishwasher safe. Avoid sudden temperature changes.",
  },
  {
    id: "ember-03",
    name: "Ember Mug",
    category: "Mug",
    price: 42,
    tagline: "Wood-fired umber finish",
    image:
      "https://images.unsplash.com/photo-1556760544-74068565f05c?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1556760544-74068565f05c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1481833761820-0509d3217039?auto=format&fit=crop&w=1200&q=80",
    ],
    description:
      "Fired alongside oak in our small wood kiln, each Ember mug emerges with its own pattern of warm umbers and toasted edges. No two are alike.",
    dimensions: "Holds 10 oz · 3.4″ tall · 3.0″ wide",
    care: "Hand wash recommended to preserve the wood-fired surface.",
  },
  {
    id: "stone-04",
    name: "Stone Side Plate",
    category: "Plate",
    price: 36,
    tagline: "Speckled granite glaze",
    image:
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=1200&q=80",
    ],
    description:
      "A perfectly-sized side plate finished in a speckled granite glaze that catches the light like river stone. Equal to a slice of toast or a small plate of olives.",
    dimensions: "7.5″ diameter · 0.5″ rim",
    care: "Dishwasher and microwave safe.",
  },
  {
    id: "mist-05",
    name: "Mist Mug",
    category: "Mug",
    price: 36,
    tagline: "Pale blue celadon",
    image:
      "https://images.unsplash.com/photo-1530538987395-032d1800fdd4?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1530538987395-032d1800fdd4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=1200&q=80",
    ],
    description:
      "A pale blue celadon mug with a glaze that breaks softly over the rim. Quiet enough for a morning ritual, sturdy enough for everyday use.",
    dimensions: "Holds 11 oz · 3.5″ tall · 3.1″ wide",
    care: "Dishwasher and microwave safe.",
  },
  {
    id: "harvest-06",
    name: "Harvest Pasta Plate",
    category: "Plate",
    price: 62,
    tagline: "Deep well, oat glaze",
    image:
      "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80",
    ],
    description:
      "A wide, generous bowl-plate built for pasta nights and brothy stews. The deep well holds a full portion; the warm oat glaze flatters every dish.",
    dimensions: "11″ diameter · 1.6″ deep",
    care: "Dishwasher safe. Avoid open-flame heating.",
  },
  {
    id: "clay-07",
    name: "Terracotta Espresso",
    category: "Mug",
    price: 28,
    tagline: "Unglazed exterior, ivory interior",
    image:
      "https://images.unsplash.com/photo-1481833761820-0509d3217039?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1481833761820-0509d3217039?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556760544-74068565f05c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1200&q=80",
    ],
    description:
      "A small terracotta cup built for a short, strong espresso. Left unglazed on the outside to reveal the warmth of the clay; finished in ivory inside.",
    dimensions: "Holds 3 oz · 2.2″ tall · 2.4″ wide",
    care: "Hand wash. Unglazed clay will deepen in tone over time.",
  },
  {
    id: "moon-08",
    name: "Moon Salad Plate",
    category: "Plate",
    price: 44,
    tagline: "Pearl white, river edge",
    image:
      "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80",
    ],
    description:
      "A pearl-white salad plate with a softly irregular edge — formed by hand, not by mold. Pairs naturally with the Linen Dinner Plate.",
    dimensions: "8.5″ diameter · 0.5″ rim",
    care: "Dishwasher and microwave safe.",
  },
  {
    id: "sable-09",
    name: "Sable Tea Bowl",
    category: "Mug",
    price: 34,
    tagline: "Charcoal matte, raw foot",
    image:
      "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556760544-74068565f05c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1530538987395-032d1800fdd4?auto=format&fit=crop&w=1200&q=80",
    ],
    description:
      "A handleless tea bowl in deep charcoal matte. Wrap both hands around the warmth of it — a quiet moment in a small object.",
    dimensions: "Holds 6 oz · 2.8″ tall · 3.5″ wide",
    care: "Hand wash recommended.",
  },
];

export function findProduct(id: string) {
  return PRODUCTS.find((p) => p.id === id);
}

export function relatedProducts(id: string, limit = 3) {
  const current = findProduct(id);
  if (!current) return [];
  return PRODUCTS.filter((p) => p.id !== id && p.category === current.category)
    .slice(0, limit);
}