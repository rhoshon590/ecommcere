export type Review = {
  id: string;
  productId: string;
  author: string;
  location: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  body: string;
  date: string; // ISO date
  verified?: boolean;
};

export const REVIEWS: Review[] = [
  // Kiln Mug
  {
    id: "r-kiln-01-1",
    productId: "kiln-01",
    author: "Maren O.",
    location: "Brooklyn, NY",
    rating: 5,
    title: "My new daily mug",
    body: "The matte glaze feels wonderful in the hand and the weight is just right. I reach for it every morning before any of the others in the cupboard.",
    date: "2024-09-12",
    verified: true,
  },
  {
    id: "r-kiln-01-2",
    productId: "kiln-01",
    author: "Daniel R.",
    location: "Austin, TX",
    rating: 5,
    title: "Subtle and beautiful",
    body: "Photos don't quite capture the depth of the ash glaze. Mine has a soft band of darker color near the foot — really lovely.",
    date: "2024-07-30",
    verified: true,
  },
  {
    id: "r-kiln-01-3",
    productId: "kiln-01",
    author: "Priya S.",
    location: "Toronto, ON",
    rating: 4,
    title: "Handle could be a touch larger",
    body: "Gorgeous piece and the glaze is perfect. The handle is comfortable but I'd love a slightly bigger opening for my full hand. Still using it daily.",
    date: "2024-05-18",
  },

  // Linen Dinner Plate
  {
    id: "r-linen-02-1",
    productId: "linen-02",
    author: "Hannah B.",
    location: "Portland, OR",
    rating: 5,
    title: "Quietly perfect",
    body: "The raw rim is what makes this. It pairs with everything and makes weekday dinners feel intentional. Bought four and will be back for more.",
    date: "2024-10-02",
    verified: true,
  },
  {
    id: "r-linen-02-2",
    productId: "linen-02",
    author: "Jules M.",
    location: "London, UK",
    rating: 5,
    title: "Better than I hoped",
    body: "Arrived beautifully packed. The ivory pools a little toward the center on mine — feels like a small painting under the food.",
    date: "2024-08-21",
    verified: true,
  },

  // Ember Mug
  {
    id: "r-ember-03-1",
    productId: "ember-03",
    author: "Toby K.",
    location: "Asheville, NC",
    rating: 5,
    title: "A small piece of art",
    body: "The wood-firing marks are stunning. Mine has a streak of toasted umber along one side that catches the light.",
    date: "2024-09-05",
    verified: true,
  },
  {
    id: "r-ember-03-2",
    productId: "ember-03",
    author: "Sasha L.",
    location: "Seattle, WA",
    rating: 4,
    title: "Smaller than expected",
    body: "Beautifully made but holds a bit less than my usual mug. Perfect for a strong morning coffee though.",
    date: "2024-06-14",
  },

  // Stone Side Plate
  {
    id: "r-stone-04-1",
    productId: "stone-04",
    author: "Eli T.",
    location: "Montreal, QC",
    rating: 5,
    title: "The speckles!",
    body: "Looks like river stone. I use these constantly for toast, olives, a slice of cake. Hardwearing too.",
    date: "2024-09-29",
    verified: true,
  },
  {
    id: "r-stone-04-2",
    productId: "stone-04",
    author: "Noor A.",
    location: "Chicago, IL",
    rating: 5,
    title: "Set of four — no regrets",
    body: "Every one is a little different which I love. They stack neatly and feel substantial without being heavy.",
    date: "2024-07-09",
    verified: true,
  },

  // Mist Mug
  {
    id: "r-mist-05-1",
    productId: "mist-05",
    author: "Camille D.",
    location: "San Francisco, CA",
    rating: 5,
    title: "The blue is so peaceful",
    body: "A soft celadon that feels like fog on water. The rim has a slightly thicker glaze break that I love.",
    date: "2024-08-04",
    verified: true,
  },
  {
    id: "r-mist-05-2",
    productId: "mist-05",
    author: "Anika V.",
    location: "Amsterdam, NL",
    rating: 4,
    title: "Lovely, minor glaze pinhole",
    body: "Tiny pinhole on the inside near the bottom — doesn't affect use and honestly feels like part of the handmade story.",
    date: "2024-06-22",
  },

  // Harvest Pasta Plate
  {
    id: "r-harvest-06-1",
    productId: "harvest-06",
    author: "Marcus H.",
    location: "Boulder, CO",
    rating: 5,
    title: "Made for pasta night",
    body: "The deep well actually holds a real portion of pasta without spilling. The oat glaze flatters every sauce.",
    date: "2024-10-11",
    verified: true,
  },
  {
    id: "r-harvest-06-2",
    productId: "harvest-06",
    author: "Greta W.",
    location: "Berlin, DE",
    rating: 5,
    title: "Generous and warm",
    body: "Larger than I expected in the best way. I've been using it for stews and grain bowls all autumn.",
    date: "2024-09-19",
    verified: true,
  },

  // Terracotta Espresso
  {
    id: "r-clay-07-1",
    productId: "clay-07",
    author: "Leo P.",
    location: "Rome, IT",
    rating: 5,
    title: "Bellissimo",
    body: "The unglazed exterior warms the espresso beautifully. Small, honest, just right.",
    date: "2024-08-13",
    verified: true,
  },
  {
    id: "r-clay-07-2",
    productId: "clay-07",
    author: "Aiko N.",
    location: "Kyoto, JP",
    rating: 4,
    title: "Lovely but stains a little",
    body: "The unglazed clay deepens over time — I personally love the patina but worth knowing if you prefer pristine.",
    date: "2024-05-30",
  },

  // Moon Salad Plate
  {
    id: "r-moon-08-1",
    productId: "moon-08",
    author: "Sienna R.",
    location: "Melbourne, AU",
    rating: 5,
    title: "Pairs beautifully with the Linen plate",
    body: "Bought both and they look like they were made for each other (they were). The irregular edge is the detail that makes it.",
    date: "2024-09-08",
    verified: true,
  },

  // Sable Tea Bowl
  {
    id: "r-sable-09-1",
    productId: "sable-09",
    author: "Yui K.",
    location: "Vancouver, BC",
    rating: 5,
    title: "Quietly perfect for matcha",
    body: "The charcoal matte against the green of matcha is striking. The raw foot is a small, lovely detail.",
    date: "2024-10-01",
    verified: true,
  },
  {
    id: "r-sable-09-2",
    productId: "sable-09",
    author: "Theo G.",
    location: "Edinburgh, UK",
    rating: 5,
    title: "A meditation in clay",
    body: "Wrapping both hands around it on a cold morning has become a ritual. Worth every penny.",
    date: "2024-07-18",
    verified: true,
  },
];

export function reviewsFor(productId: string) {
  return REVIEWS.filter((r) => r.productId === productId).sort(
    (a, b) => +new Date(b.date) - +new Date(a.date),
  );
}

export type RatingSummary = {
  count: number;
  average: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

export function ratingSummary(productId: string): RatingSummary {
  const list = reviewsFor(productId);
  const distribution: RatingSummary["distribution"] = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  list.forEach((r) => {
    distribution[r.rating] += 1;
  });
  const sum = list.reduce((acc, r) => acc + r.rating, 0);
  const average = list.length === 0 ? 0 : sum / list.length;
  return { count: list.length, average, distribution };
}
