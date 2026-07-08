import "dotenv/config";
import { prisma } from "./db.js";

const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

if (!adminEmail) {
  console.error("ADMIN_EMAIL is required.");
  process.exit(1);
}

const admin = await prisma.user.findUnique({
  where: { email: adminEmail },
  select: { id: true, email: true },
});

if (!admin) {
  console.error(`No user found with email ${adminEmail}. Sign up first, then run this script again.`);
  process.exit(1);
}

await prisma.user.updateMany({
  where: { email: { not: adminEmail } },
  data: { role: "CUSTOMER" },
});

await prisma.user.update({
  where: { email: adminEmail },
  data: { role: "ADMIN" },
});

console.log(`Admin access granted to ${admin.email}. All other users are CUSTOMER.`);
