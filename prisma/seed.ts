/**
 * Seed: menu + test accounts.
 *
 *   npm run db:seed
 *
 * Accounts: owner@example.com / admin1234   (ADMIN)
 *           client@example.com / client1234 (CUSTOMER)
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ---------- menu ----------
const categories = [
  { slug: "dumplings", nameFr: "Raviolis", nameEn: "Dumplings", nameZh: "饺子", sortOrder: 1 },
  { slug: "noodles", nameFr: "Nouilles", nameEn: "Noodles", nameZh: "面食", sortOrder: 2 },
  { slug: "rice", nameFr: "Riz et plats", nameEn: "Rice & mains", nameZh: "饭类", sortOrder: 3 },
  { slug: "sides", nameFr: "Entrées", nameEn: "Sides", nameZh: "小菜", sortOrder: 4 },
  { slug: "drinks", nameFr: "Boissons", nameEn: "Drinks", nameZh: "饮品", sortOrder: 5 },
];

type ItemSeed = {
  cat: string; slug: string; fr: string; en: string; zh: string; price: number;
  loyalty?: boolean; descFr?: string; descEn?: string; descZh?: string;
};
const items: ItemSeed[] = [
  { cat: "dumplings", slug: "pork-cabbage", fr: "Raviolis porc et chou (12)", en: "Pork & cabbage dumplings (12)", zh: "猪肉白菜饺（12个）", price: 1395, loyalty: true, descFr: "Fait maison, bouillis ou poêlés.", descEn: "Handmade, boiled or pan-fried.", descZh: "手工现包，可水煮或煎。" },
  { cat: "dumplings", slug: "pork-chive", fr: "Raviolis porc et ciboule (12)", en: "Pork & chive dumplings (12)", zh: "猪肉韭菜饺（12个）", price: 1395, loyalty: true },
  { cat: "dumplings", slug: "beef-onion", fr: "Raviolis bœuf et oignon (12)", en: "Beef & onion dumplings (12)", zh: "牛肉洋葱饺（12个）", price: 1495, loyalty: true },
  { cat: "dumplings", slug: "lamb-coriander", fr: "Raviolis agneau et coriandre (12)", en: "Lamb & coriander dumplings (12)", zh: "羊肉香菜饺（12个）", price: 1595, loyalty: true },
  { cat: "dumplings", slug: "shrimp-pork", fr: "Raviolis crevettes et porc (12)", en: "Shrimp & pork dumplings (12)", zh: "虾仁猪肉饺（12个）", price: 1695, loyalty: true },
  { cat: "dumplings", slug: "veggie", fr: "Raviolis végétariens (12)", en: "Vegetable dumplings (12)", zh: "素三鲜饺（12个）", price: 1295, loyalty: true },
  { cat: "dumplings", slug: "frozen-pack", fr: "Sac congelé (50 raviolis)", en: "Frozen pack (50 dumplings)", zh: "速冻饺子（50个）", price: 3200, loyalty: true },
  { cat: "noodles", slug: "zhajiang", fr: "Nouilles Zhajiang", en: "Zhajiang noodles", zh: "炸酱面", price: 1395 },
  { cat: "noodles", slug: "beef-noodle-soup", fr: "Soupe de nouilles au bœuf", en: "Beef noodle soup", zh: "牛肉面", price: 1595 },
  { cat: "noodles", slug: "dan-dan", fr: "Nouilles Dan Dan", en: "Dan Dan noodles", zh: "担担面", price: 1295 },
  { cat: "noodles", slug: "cold-noodles", fr: "Nouilles froides sésame", en: "Cold sesame noodles", zh: "麻酱凉面", price: 1195 },
  { cat: "rice", slug: "kungpao", fr: "Poulet Kung Pao avec riz", en: "Kung Pao chicken with rice", zh: "宫保鸡丁饭", price: 1495 },
  { cat: "rice", slug: "mapo", fr: "Tofu Mapo avec riz", en: "Mapo tofu with rice", zh: "麻婆豆腐饭", price: 1295 },
  { cat: "rice", slug: "fried-rice", fr: "Riz frit maison", en: "House fried rice", zh: "扬州炒饭", price: 1195 },
  { cat: "rice", slug: "braised-pork", fr: "Porc braisé avec riz", en: "Braised pork belly with rice", zh: "红烧肉饭", price: 1595 },
  { cat: "sides", slug: "cucumber", fr: "Salade de concombre à l'ail", en: "Smashed cucumber salad", zh: "拍黄瓜", price: 695 },
  { cat: "sides", slug: "scallion-pancake", fr: "Crêpe aux oignons verts", en: "Scallion pancake", zh: "葱油饼", price: 595 },
  { cat: "sides", slug: "wood-ear", fr: "Salade de champignons noirs", en: "Wood ear mushroom salad", zh: "凉拌木耳", price: 795 },
  { cat: "sides", slug: "pork-buns", fr: "Petits pains au porc (3)", en: "Pork buns (3)", zh: "鲜肉包（3个）", price: 795 },
  { cat: "drinks", slug: "soy-milk", fr: "Lait de soya", en: "Soy milk", zh: "豆浆", price: 350 },
  { cat: "drinks", slug: "jasmine-tea", fr: "Thé au jasmin", en: "Jasmine tea", zh: "茉莉花茶", price: 300 },
  { cat: "drinks", slug: "soda", fr: "Boisson gazeuse", en: "Soft drink", zh: "汽水", price: 250 },
];


async function main() {
  console.log("Clearing tables…");
  await prisma.$transaction([
    prisma.loyaltyTransaction.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.reservation.deleteMany(),
    prisma.review.deleteMany(),
    prisma.dailyLog.deleteMany(),
    prisma.menuItem.deleteMany(),
    prisma.menuCategory.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // ---------- users ----------
  console.log("Users…");
  const adminHash = await bcrypt.hash("admin1234", 10);
  const clientHash = await bcrypt.hash("client1234", 10);
  const admin = await prisma.user.create({
    data: { email: process.env.ADMIN_EMAIL ?? "owner@example.com", passwordHash: adminHash, name: "Propriétaire", role: "ADMIN", locale: "zh" },
  });
  const demoClient = await prisma.user.create({
    data: { email: "client@example.com", passwordHash: clientHash, name: "Client Démo", phone: "514-555-0100", locale: "fr" },
  });

  // ---------- menu ----------
  console.log("Menu…");
  const catMap = new Map<string, string>();
  for (const c of categories) {
    const created = await prisma.menuCategory.create({ data: c });
    catMap.set(c.slug, created.id);
  }
  let count = 0;
  let sort = 0;
  for (const it of items) {
    await prisma.menuItem.create({
      data: {
        categoryId: catMap.get(it.cat)!,
        slug: it.slug,
        nameFr: it.fr, nameEn: it.en, nameZh: it.zh,
        descFr: it.descFr, descEn: it.descEn, descZh: it.descZh,
        priceCents: it.price,
        isLoyaltyEligible: !!it.loyalty,
        isAvailable: it.slug !== "lamb-coriander", // one sold-out item to test the badge
        sortOrder: sort++,
      },
    });
    count++;
  }

  console.log(`Done. ${count} menu items. Admin: ${admin.email} / admin1234  Customer: ${demoClient.email} / client1234`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
