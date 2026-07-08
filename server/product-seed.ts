import type { Prisma } from "../generated/prisma/client.js";
import type { ProductCategory } from "../generated/prisma/enums.js";
import { products } from "../src/data/products.js";
import { prisma } from "./db.js";

export async function seedInitialProducts() {
  const productCount = await prisma.product.count();

  if (productCount > 0) {
    return;
  }

  await prisma.product.createMany({
    data: products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      longDescription: product.longDescription,
      price: product.price,
      category: product.category as ProductCategory,
      sizes: product.sizes,
      colors: product.colors as unknown as Prisma.InputJsonValue,
      images: product.images,
      tags: product.tags,
      collection: product.collection,
      materials: product.materials,
      care: product.care,
      isLimited: product.isLimited,
    })),
    skipDuplicates: true,
  });
}
