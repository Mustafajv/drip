import { randomUUID } from "crypto";
import { Router } from "express";
import type { OrderStatus } from "../../generated/prisma/enums.js";
import { prisma } from "../db.js";
import { getAuthedUser, requireAdmin, requireUser } from "../auth-guards.js";

const router = Router();

type OrderPayload = {
  orderData?: {
    firstName?: unknown;
    lastName?: unknown;
    email?: unknown;
    address?: unknown;
    city?: unknown;
    postalCode?: unknown;
  };
  items?: unknown;
};

const orderStatuses = new Set<OrderStatus>(["confirmed", "processing", "shipped"]);

function requireString(value: unknown, field: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} is required`);
  }

  return value.trim();
}

function parseOrderPayload(payload: OrderPayload) {
  if (!payload.orderData) {
    throw new Error("orderData is required");
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    throw new Error("items are required");
  }

  const items = payload.items.map(item => {
    if (!item || typeof item !== "object") {
      throw new Error("items are invalid");
    }

    const productId = requireString((item as { productId?: unknown }).productId, "productId");
    const selectedSize = requireString((item as { selectedSize?: unknown }).selectedSize, "selectedSize");
    const selectedColor = requireString((item as { selectedColor?: unknown }).selectedColor, "selectedColor");
    const quantity = Number((item as { quantity?: unknown }).quantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error("quantity must be greater than zero");
    }

    return {
      productId,
      selectedSize,
      selectedColor,
      quantity,
    };
  });

  return {
    orderData: {
      firstName: requireString(payload.orderData.firstName, "firstName"),
      lastName: requireString(payload.orderData.lastName, "lastName"),
      email: requireString(payload.orderData.email, "email"),
      address: requireString(payload.orderData.address, "address"),
      city: requireString(payload.orderData.city, "city"),
      postalCode: requireString(payload.orderData.postalCode, "postalCode"),
    },
    items,
  };
}

function toOrderResponse(order: {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  createdAt: Date;
  items: {
    id: string;
    productId: string;
    productName: string;
    productImage: string;
    selectedSize: string;
    selectedColor: string;
    quantity: number;
    unitPrice: number;
  }[];
}) {
  return {
    id: order.id,
    items: order.items,
    shipping: {
      firstName: order.firstName,
      lastName: order.lastName,
      address: order.address,
      city: order.city,
      postalCode: order.postalCode,
    },
    subtotal: order.subtotal,
    tax: order.tax,
    total: order.total,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
  };
}

function toAdminOrderResponse(order: Parameters<typeof toOrderResponse>[0] & {
  email: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}) {
  return {
    ...toOrderResponse(order),
    email: order.email,
    customer: order.user,
  };
}

router.post("/orders", requireUser, async (req, res, next) => {
  try {
    const user = getAuthedUser(req);

    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const { orderData, items } = parseOrderPayload(req.body);
    const products = await prisma.product.findMany({
      where: { id: { in: items.map(item => item.productId) } },
    });
    const productsById = new Map(products.map(product => [product.id, product]));

    const orderItems = items.map(item => {
      const product = productsById.get(item.productId);

      if (!product) {
        throw new Error(`Product ${item.productId} was not found`);
      }

      return {
        id: randomUUID(),
        productId: product.id,
        productName: product.name,
        productImage: product.images[0] ?? "",
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        quantity: item.quantity,
        unitPrice: product.price,
      };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const tax = Math.round(subtotal * 0.2);
    const total = subtotal + tax;

    const order = await prisma.order.create({
      data: {
        id: `ORD-${Date.now()}`,
        userId: user.id,
        firstName: orderData.firstName,
        lastName: orderData.lastName,
        email: orderData.email,
        address: orderData.address,
        city: orderData.city,
        postalCode: orderData.postalCode,
        subtotal,
        tax,
        total,
        status: "confirmed",
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    });

    res.status(201).json(toOrderResponse(order));
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }

    next(error);
  }
});

router.get("/orders", requireUser, async (req, res, next) => {
  try {
    const user = getAuthedUser(req);

    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(orders.map(toOrderResponse));
  } catch (error) {
    next(error);
  }
});

router.get("/admin/orders", requireAdmin, async (_req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(orders.map(toAdminOrderResponse));
  } catch (error) {
    next(error);
  }
});

router.put("/admin/orders/:id/status", requireAdmin, async (req, res, next) => {
  try {
    const orderId = typeof req.params.id === "string" ? req.params.id : "";
    const status = typeof req.body.status === "string" ? req.body.status : "";

    if (!orderStatuses.has(status as OrderStatus)) {
      res.status(400).json({ error: "status is invalid" });
      return;
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: status as OrderStatus },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json(toAdminOrderResponse(order));
  } catch (error) {
    next(error);
  }
});

export default router;
