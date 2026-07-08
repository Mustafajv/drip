import "dotenv/config";
import { prisma } from "./db.js";

const API_BASE_URL = process.env.SMOKE_API_BASE_URL ?? "http://localhost:3000/api";
const REQUEST_ORIGIN = process.env.SMOKE_REQUEST_ORIGIN ?? "http://localhost:3000";
const password = "Password123!";
const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

type SmokeUser = {
  name: string;
  email: string;
};

type ProductResponse = {
  id: string;
  name: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
};

type OrderResponse = {
  id: string;
  status: "confirmed" | "processing" | "shipped";
  items: unknown[];
  total: number;
};

type AdminOrderResponse = OrderResponse & {
  customer: {
    email: string;
  };
};

class CookieJar {
  private readonly cookies = new Map<string, string>();

  store(response: Response) {
    const headers = response.headers as Headers & {
      getSetCookie?: () => string[];
    };
    const setCookies = headers.getSetCookie?.() ?? [response.headers.get("set-cookie")].filter(Boolean);

    for (const setCookie of setCookies) {
      const [cookie] = setCookie.split(";");
      const separatorIndex = cookie.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      this.cookies.set(cookie.slice(0, separatorIndex), cookie.slice(separatorIndex + 1));
    }
  }

  header() {
    return [...this.cookies.entries()]
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { jar?: CookieJar; expectedStatus?: number } = {}
): Promise<T> {
  const { jar, expectedStatus = 200, headers, ...requestOptions } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: {
      "Content-Type": "application/json",
      Origin: REQUEST_ORIGIN,
      ...(jar?.header() ? { Cookie: jar.header() } : {}),
      ...headers,
    },
  });

  jar?.store(response);

  if (response.status !== expectedStatus) {
    const body = await response.text();
    throw new Error(`${path} returned ${response.status}; expected ${expectedStatus}. ${body}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function signUp(user: SmokeUser) {
  const jar = new CookieJar();

  await request("/auth/sign-up/email", {
    method: "POST",
    jar,
    body: JSON.stringify({
      name: user.name,
      email: user.email,
      password,
    }),
  });

  return jar;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const customer: SmokeUser = {
  name: "Smoke Customer",
  email: `customer-${runId}@drip.local`,
};

const admin: SmokeUser = {
  name: "Smoke Admin",
  email: `admin-${runId}@drip.local`,
};

try {
  console.log("Creating customer and admin sessions...");
  const customerJar = await signUp(customer);
  const adminJar = await signUp(admin);

  await prisma.user.update({
    where: { email: admin.email },
    data: { role: "ADMIN" },
  });

  console.log("Checking customer cannot access admin orders...");
  await request("/admin/orders", {
    jar: customerJar,
    expectedStatus: 403,
  });

  console.log("Creating a customer order...");
  const products = await request<ProductResponse[]>("/products", { jar: customerJar });
  const product = products.find(item => item.sizes.length > 0 && item.colors.length > 0);
  assert(product, "No orderable product found.");

  const order = await request<OrderResponse>("/orders", {
    method: "POST",
    jar: customerJar,
    expectedStatus: 201,
    body: JSON.stringify({
      orderData: {
        firstName: "Smoke",
        lastName: "Customer",
        email: customer.email,
        address: "101 Test Avenue",
        city: "Karachi",
        postalCode: "74000",
      },
      items: [
        {
          productId: product.id,
          selectedSize: product.sizes[0],
          selectedColor: product.colors[0].name,
          quantity: 1,
        },
      ],
    }),
  });

  assert(order.status === "confirmed", "New customer order should start as confirmed.");

  console.log("Checking admin can list and update customer orders...");
  const adminOrders = await request<AdminOrderResponse[]>("/admin/orders", { jar: adminJar });
  const adminOrder = adminOrders.find(item => item.id === order.id);
  assert(adminOrder, "Admin order list did not include the customer order.");
  assert(adminOrder.customer.email === customer.email, "Admin order list returned the wrong customer.");

  const updatedOrder = await request<AdminOrderResponse>(`/admin/orders/${order.id}/status`, {
    method: "PUT",
    jar: adminJar,
    body: JSON.stringify({ status: "processing" }),
  });

  assert(updatedOrder.status === "processing", "Admin order status update did not persist.");

  console.log("Checking customer can see updated status on their own order...");
  const customerOrders = await request<OrderResponse[]>("/orders", { jar: customerJar });
  const customerOrder = customerOrders.find(item => item.id === order.id);
  assert(customerOrder?.status === "processing", "Customer order history did not reflect admin status update.");

  console.log("Authenticated customer/admin smoke flow passed.");
} finally {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [customer.email, admin.email],
      },
    },
  });

  await prisma.$disconnect();
}
