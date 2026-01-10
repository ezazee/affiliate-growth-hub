const products = [
  {
    id: "product1",
    name: "CICA-B5 Refreshing Toner",
    slug: "cica-b5-refreshing-toner",
    price: 144000,
    description:
      "Toner dengan CICA dan Vitamin B5 untuk menenangkan kulit, menjaga kelembapan, dan memperkuat skin barrier.",
    imageUrl:
      "https://blsfkizrchqzahqa.public.blob.vercel-storage.com/CICA-B5-REFRESHING",
    commissionType: "percentage",
    commissionValue: 10,
    isActive: true,
  },
  {
    id: "product2",
    name: "Vit C Tone-Up Daycream SPF 50",
    slug: "vit-c-tone-up-daycream-spf-50",
    price: 144000,
    description:
      "Day cream dengan Vitamin C dan SPF 50 untuk mencerahkan kulit sekaligus melindungi dari sinar UV.",
    imageUrl:
      "https://blsfkizrchqzahqa.public.blob.vercel-storage.com/600x750_VIT-C-TONE-UP--DAY-CREAM-SPF50.jpg",
    commissionType: "percentage",
    commissionValue: 10,
    isActive: true,
  },
  {
    id: "product3",
    name: "Honey Cleansing Gel",
    slug: "honey-cleansing-gel",
    price: 144000,
    description:
      "Facial cleanser berbahan madu untuk membersihkan wajah dengan lembut tanpa membuat kulit kering.",
    imageUrl:
      "https://blsfkizrchqzahqa.public.blob.vercel-storage.com/HONEY%20CLEANSING%20GEL",
    commissionType: "percentage",
    commissionValue: 10,
    isActive: true,
  },
  {
    id: "product4",
    name: "PE Prebiotic Pore-EX Facial Pad",
    slug: "pe-prebiotic-pore-ex-facial-pad",
    price: 144000,
    description:
      "Facial pad dengan prebiotic untuk membantu membersihkan pori dan menjaga keseimbangan mikrobioma kulit.",
    imageUrl:
      "https://blsfkizrchqzahqa.public.blob.vercel-storage.com/600x750_PREBIOTIC-PORE-EX.jpg",
    commissionType: "percentage",
    commissionValue: 10,
    isActive: true,
  },
  {
    id: "product5",
    name: "Hydro Restorative Cream",
    slug: "hydro-restorative-cream",
    price: 144000,
    description:
      "Moisturizer untuk membantu memperbaiki skin barrier dan menjaga hidrasi kulit sepanjang hari.",
    imageUrl:
      "https://blsfkizrchqzahqa.public.blob.vercel-storage.com/600x750_HYDRO-RESTORATIVE-CREAM.jpg",
    commissionType: "percentage",
    commissionValue: 10,
    isActive: true,
  },
  {
    id: "product6",
    name: "Skin Awakening Glow Serum",
    slug: "skin-awakening-glow-serum",
    price: 144000,
    description:
      "Serum pencerah yang membantu membuat kulit tampak lebih glowing dan sehat.",
    imageUrl:
      "https://blsfkizrchqzahqa.public.blob.vercel-storage.com/600x750_SKIN-AWAKENING-GLOW-SERUM.jpg",
    commissionType: "percentage",
    commissionValue: 10,
    isActive: true,
  },
  {
    id: "product7",
    name: "Intimate Feminine Mousse Cleanser",
    slug: "intimate-feminine-mousse-cleanser",
    price: 144000,
    description:
      "Pembersih area kewanitaan berbentuk mousse dengan formula lembut untuk penggunaan harian.",
    imageUrl:
      "https://blsfkizrchqzahqa.public.blob.vercel-storage.com/600x750_PREBIOTIC-FEMININE-MOUSSE-CLEANSER.jpg",
    commissionType: "percentage",
    commissionValue: 10,
    isActive: true,
  },
];


const users = [
  {
    id: "admin1",
    name: "Admin User",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
    status: "approved",
    createdAt: new Date(),
  },
  {
    id: "affiliator1",
    name: "Alice Wonderland",
    email: "alice@example.com",
    password: "password123",
    role: "affiliator",
    status: "approved",
    createdAt: new Date(),
  },
  {
    id: "affiliator2",
    name: "Bob The Builder",
    email: "bob@example.com",
    password: "password123",
    role: "affiliator",
    status: "rejected",
    createdAt: new Date(),
  },
];

const affiliateLinks = [
  {
    id: "link1",
    affiliatorId: "affiliator1",
    productId: "product1",
    code: "ALICE123",
    isActive: true,
    createdAt: new Date(),
  },
];

module.exports = {
  products,
  users,
  affiliateLinks,
};