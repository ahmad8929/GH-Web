export type UserRole = {
  id: string;
  label: string;
  subtitle: string;
  description: string;
};

export type Category = {
  slug: string;
  name: string;
  description: string;
  count: number;
  accent: string;
};

export type Product = {
  slug: string;
  title: string;
  description: string;
  category: string;
  portal: "Marketplace" | "Textbooks" | "Uniforms" | "Donation";
  condition: string;
  price: number;
  school: string;
  grade: string;
  subject: string;
  location: string;
  seller: string;
  sellerRole: string;
  compatibility: string;
  status: string;
  badge: string;
};

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Market" },
  { href: "/#categories", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/donate", label: "Donate" },
  { href: "/sell", label: "Sell" },
];

export const userRoles: UserRole[] = [
  {
    id: "student",
    label: "Student",
    subtitle: "Fast access to affordable essentials",
    description:
      "Buy books, uniforms, calculators, lab kits, and sports gear matched to your class and school.",
  },
  {
    id: "parent",
    label: "Parent",
    subtitle: "Lower costs across the school year",
    description:
      "Compare quality, price, school compatibility, and location before making a purchase.",
  },
  {
    id: "school",
    label: "School",
    subtitle: "Organize approved school communities",
    description:
      "Manage verified listings, announcements, donation drives, and uniform or textbook circulation.",
  },
  {
    id: "tuition",
    label: "Tuition/Coaching Institute",
    subtitle: "Support learners beyond the classroom",
    description:
      "Recommend study materials, devices, and project tools relevant to enrolled students.",
  },
];

export const categories: Category[] = [
  {
    slug: "textbooks",
    name: "Books",
    description: "Used and new books by class and subject.",
    count: 248,
    accent: "books",
  },
  {
    slug: "uniforms",
    name: "Uniform",
    description: "Shirts, blazers, shoes, and sets.",
    count: 132,
    accent: "uniforms",
  },
  {
    slug: "stationery",
    name: "Stationery",
    description: "Pens, notebooks, files, and kits.",
    count: 179,
    accent: "stationery",
  },
  {
    slug: "devices",
    name: "Devices",
    description: "Calculators, tablets, and lab tools.",
    count: 64,
    accent: "devices",
  },
  {
    slug: "bags",
    name: "Bags",
    description: "School bags and storage essentials.",
    count: 93,
    accent: "bags",
  },
  {
    slug: "donation",
    name: "Donate",
    description: "Give useful items a second life.",
    count: 87,
    accent: "donation",
  },
];

export const stats = [
  { label: "Schools", value: "120+" },
  { label: "Listings", value: "4.8k" },
  { label: "Reused", value: "18k" },
  { label: "Donations", value: "2.1k" },
];

export const featuredProducts: Product[] = [
  {
    slug: "cbse-grade-9-math-bundle",
    title: "CBSE Grade 9 Math Bundle",
    description:
      "NCERT mathematics textbook, solved examples notebook, and exam practice sheets in clean condition.",
    category: "Textbooks",
    portal: "Textbooks",
    condition: "Gently Used",
    price: 650,
    school: "Delhi Public School, Noida",
    grade: "Grade 9",
    subject: "Mathematics",
    location: "Sector 62, Noida",
    seller: "Ananya S.",
    sellerRole: "Parent",
    compatibility: "CBSE 2026 curriculum",
    status: "Ready for pickup",
    badge: "Best value",
  },
  {
    slug: "st-xaviers-boys-uniform-set",
    title: "St. Xavier's Boys Uniform Set",
    description:
      "Blazer, two shirts, and one trouser set for middle school students with school-approved colors.",
    category: "Uniforms",
    portal: "Uniforms",
    condition: "Like New",
    price: 1400,
    school: "St. Xavier's School",
    grade: "Grade 7-8",
    subject: "Uniform",
    location: "Salt Lake, Kolkata",
    seller: "Rahul M.",
    sellerRole: "Student",
    compatibility: "Middle school boys uniform",
    status: "Verified seller",
    badge: "Top pick",
  },
  {
    slug: "scientific-calculator-fx-991cw",
    title: "Scientific Calculator fx-991CW",
    description:
      "Approved for senior secondary maths and physics classes, includes case and quick-start guide.",
    category: "Learning Devices",
    portal: "Marketplace",
    condition: "New",
    price: 1190,
    school: "National Academy",
    grade: "Grade 11-12",
    subject: "Mathematics",
    location: "Indiranagar, Bengaluru",
    seller: "StudyMart Hub",
    sellerRole: "Tuition/Coaching Institute",
    compatibility: "Science stream",
    status: "Ships in 24 hours",
    badge: "Exam ready",
  },
  {
    slug: "community-donation-school-bags-pack",
    title: "Donation Drive School Bags Pack",
    description:
      "Five durable school bags collected for verified donation partners and community distribution.",
    category: "Donation Essentials",
    portal: "Donation",
    condition: "Reusable",
    price: 0,
    school: "Community Collection",
    grade: "Mixed",
    subject: "General",
    location: "Lucknow Central",
    seller: "Hope Parent Circle",
    sellerRole: "Parent",
    compatibility: "Donation only",
    status: "Awaiting NGO pickup",
    badge: "Donation",
  },
  {
    slug: "chemistry-lab-kit-class-10",
    title: "Chemistry Lab Kit for Class 10",
    description:
      "Protective goggles, droppers, measuring cylinder, and labelled experiment tray for practical sessions.",
    category: "Lab Equipment",
    portal: "Marketplace",
    condition: "Gently Used",
    price: 900,
    school: "Ryan International School",
    grade: "Grade 10",
    subject: "Chemistry",
    location: "Rohini, Delhi",
    seller: "LabLearn Store",
    sellerRole: "School",
    compatibility: "Class 10 chemistry practical",
    status: "Approved listing",
    badge: "Lab ready",
  },
  {
    slug: "junior-cricket-kit",
    title: "Junior Cricket Practice Kit",
    description:
      "Bat, pads, gloves, and helmet bundle ideal for school sports trials and coaching practice.",
    category: "Sports Gear",
    portal: "Marketplace",
    condition: "Gently Used",
    price: 1750,
    school: "Springfield Public School",
    grade: "Grade 6-9",
    subject: "Sports",
    location: "Vastrapur, Ahmedabad",
    seller: "Kabir T.",
    sellerRole: "Student",
    compatibility: "Junior cricket practice",
    status: "Pickup or local delivery",
    badge: "Sports deal",
  },
];

export const schoolPartners = [
  {
    name: "Delhi Public School, Noida",
    location: "Noida",
    members: "840 families",
    focus: "Textbook reuse and verified parent listings",
  },
  {
    name: "St. Xavier's School",
    location: "Kolkata",
    members: "510 families",
    focus: "Uniform exchange and donation drives",
  },
  {
    name: "National Academy",
    location: "Bengaluru",
    members: "620 families",
    focus: "Exam tools, calculators, and lab equipment",
  },
  {
    name: "Green Valley Public School",
    location: "Pune",
    members: "430 families",
    focus: "Community-led stationery banks",
  },
];

export const adminModules = [
  "User management and verification",
  "School and institute approvals",
  "Category and subcategory control",
  "Listing review and moderation queue",
  "Reported items and fraud monitoring",
  "Featured products and campaign banners",
  "Announcements and notifications",
  "Transactions, exports, and analytics",
  "Support tickets, disputes, and ratings",
  "Platform settings and moderation rules",
];

export const footerColumns = [
  {
    title: "Marketplace",
    links: [
      { href: "/marketplace", label: "Marketplace" },
      { href: "/textbooks", label: "Used books" },
      { href: "/uniforms", label: "Used uniforms" },
      { href: "/sell", label: "Sell item" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/contact", label: "Contact us" },
      { href: "/donate", label: "Donate" },
      { href: "/schools", label: "Schools" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy-policy", label: "Privacy policy" },
      { href: "/terms-and-conditions", label: "Terms and conditions" },
      { href: "/login", label: "Login" },
      { href: "/signup", label: "Sign up" },
    ],
  },
];

export function getProductBySlug(slug: string) {
  return featuredProducts.find((product) => product.slug === slug);
}

export const listingFilters = [
  "School",
  "Class/Grade",
  "Category",
  "Condition",
  "Price range",
  "Location",
  "Subject",
];
