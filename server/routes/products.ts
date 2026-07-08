import { Router } from "express";
import type { Prisma } from "../../generated/prisma/client.js";
import type { ProductCategory } from "../../generated/prisma/enums.js";
import { prisma } from "../db.js";
import { requireAdmin } from "../auth-guards.js";

const router = Router();

const categories = new Set(["outerwear", "knitwear", "footwear", "accessories", "trousers"]);

type ProductPayload = {
  name?: unknown;
  description?: unknown;
  longDescription?: unknown;
  price?: unknown;
  category?: unknown;
  sizes?: unknown;
  colors?: unknown;
  images?: unknown;
  tags?: unknown;
  collection?: unknown;
  materials?: unknown;
  care?: unknown;
  isLimited?: unknown;
};

function createProductId(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || `product-${Date.now()}`;
}

function toProductResponse(product: {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  category: ProductCategory;
  sizes: string[];
  colors: Prisma.JsonValue;
  images: string[];
  tags: string[];
  collection: string;
  materials: string;
  care: string;
  isLimited: boolean;
}) {
  return {
    ...product,
    colors: Array.isArray(product.colors) ? product.colors : [],
  };
}

function requireString(value: unknown, field: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} is required`);
  }

  return value.trim();
}

function getParam(value: string | string[] | undefined, field: string) {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim().length > 0) {
    return value[0];
  }

  throw new Error(`${field} is required`);
}

function requireStringArray(value: unknown, field: string) {
  if (!Array.isArray(value) || value.some(item => typeof item !== "string" || item.trim().length === 0)) {
    throw new Error(`${field} must contain strings`);
  }

  return value.map(item => item.trim());
}

function parseProductPayload(payload: ProductPayload) {
  const category = requireString(payload.category, "category");

  if (!categories.has(category)) {
    throw new Error("category is invalid");
  }

  const price = Number(payload.price);

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("price must be greater than zero");
  }

  if (!Array.isArray(payload.colors)) {
    throw new Error("colors must be an array");
  }

  const colors = payload.colors.map(color => {
    if (
      !color ||
      typeof color !== "object" ||
      typeof (color as { name?: unknown }).name !== "string" ||
      typeof (color as { hex?: unknown }).hex !== "string"
    ) {
      throw new Error("colors must include name and hex");
    }

    return {
      name: (color as { name: string }).name.trim(),
      hex: (color as { hex: string }).hex.trim(),
    };
  });

  if (colors.length === 0) {
    throw new Error("colors must include at least one color");
  }

  return {
    name: requireString(payload.name, "name"),
    description: requireString(payload.description, "description"),
    longDescription: requireString(payload.longDescription, "longDescription"),
    price: Math.round(price),
    category: category as ProductCategory,
    sizes: requireStringArray(payload.sizes, "sizes"),
    colors,
    images: requireStringArray(payload.images, "images"),
    tags: requireStringArray(payload.tags, "tags"),
    collection: requireString(payload.collection, "collection"),
    materials: requireString(payload.materials, "materials"),
    care: requireString(payload.care, "care"),
    isLimited: Boolean(payload.isLimited),
  };
}

async function createUniqueProductId(name: string) {
  const baseId = createProductId(name);
  let id = baseId;
  let suffix = 2;

  while (await prisma.product.findUnique({ where: { id }, select: { id: true } })) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }

  return id;
}

router.get("/products", async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    let filtered = products.map(toProductResponse);
    const categories = typeof req.query.categories === "string" ? req.query.categories.split(",").filter(Boolean) : [];
    const sizes = typeof req.query.sizes === "string" ? req.query.sizes.split(",").filter(Boolean) : [];
    const colors = typeof req.query.colors === "string" ? req.query.colors.split(",").filter(Boolean) : [];
    const maxPrice = typeof req.query.maxPrice === "string" ? Number(req.query.maxPrice) : undefined;
    const search = typeof req.query.search === "string" ? req.query.search.toLowerCase().trim() : "";

    if (categories.length > 0) {
      filtered = filtered.filter(product => categories.includes(product.category));
    }

    if (sizes.length > 0) {
      filtered = filtered.filter(product => product.sizes.some(size => sizes.includes(size)));
    }

    if (colors.length > 0) {
      filtered = filtered.filter(product =>
        product.colors.some(color =>
          Boolean(
            color &&
              typeof color === "object" &&
              "name" in color &&
              colors.includes(String(color.name))
          )
        )
      );
    }

    if (Number.isFinite(maxPrice)) {
      filtered = filtered.filter(product => product.price <= Number(maxPrice));
    }

    if (search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search) ||
        product.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }

    res.json(filtered);
  } catch (error) {
    next(error);
  }
});

router.get("/products/:id", async (req, res, next) => {
  try {
    const productId = getParam(req.params.id, "id");
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json(toProductResponse(product));
  } catch (error) {
    next(error);
  }
});

router.post("/admin/products", requireAdmin, async (req, res, next) => {
  try {
    const productData = parseProductPayload(req.body);
    const product = await prisma.product.create({
      data: {
        id: await createUniqueProductId(productData.name),
        ...productData,
        colors: productData.colors as Prisma.InputJsonValue,
      },
    });

    res.status(201).json(toProductResponse(product));
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }

    next(error);
  }
});

router.put("/admin/products/:id", requireAdmin, async (req, res, next) => {
  try {
    const productId = getParam(req.params.id, "id");
    const productData = parseProductPayload(req.body);
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        ...productData,
        colors: productData.colors as Prisma.InputJsonValue,
      },
    });

    res.json(toProductResponse(product));
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }

    next(error);
  }
});

router.delete("/admin/products/:id", requireAdmin, async (req, res, next) => {
  try {
    const productId = getParam(req.params.id, "id");
    await prisma.product.delete({
      where: { id: productId },
    });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
