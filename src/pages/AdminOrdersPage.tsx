import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, PackageCheck, Search } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAdminOrderMutations, useAdminOrders } from '@/hooks/useOrders';
import type { AdminOrder, OrderStatus } from '@/types';

const statuses: OrderStatus[] = ['confirmed', 'processing', 'shipped'];

function formatMoney(value: number) {
  return `$${value.toLocaleString()}.00`;
}

function itemCount(order: AdminOrder) {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

export default function AdminOrdersPage() {
  const { data: orders = [], isLoading } = useAdminOrders();
  const { updateStatus } = useAdminOrderMutations();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) {
      return orders;
    }

    return orders.filter(order =>
      [
        order.id,
        order.customer.name,
        order.customer.email,
        order.email,
        order.status,
        `${order.shipping.firstName} ${order.shipping.lastName}`,
      ].some(value => value.toLowerCase().includes(normalizedSearch))
    );
  }, [orders, search]);

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    updateStatus.mutate({ orderId, status });
  };

  return (
    <div className="min-h-screen bg-[#131313]">
      <Navbar />

      <main className="pt-28 px-6 md:px-12 pb-20 max-w-[1920px] mx-auto">
        <header className="flex flex-col gap-6 border-b border-neutral-800 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Back office</p>
            <h1 className="mt-2 font-headline text-4xl uppercase tracking-tight text-white md:text-5xl">
              Orders
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin"
              className="border border-neutral-700 px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-neutral-300 transition-colors hover:border-white hover:text-white"
            >
              Products
            </Link>
            <Link
              to="/products"
              className="border border-neutral-700 px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-neutral-300 transition-colors hover:border-white hover:text-white"
            >
              View Store
            </Link>
          </div>
        </header>

        <section className="pt-10">
          <div className="flex flex-col gap-4 border-b border-neutral-800 pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Fulfillment Queue</h2>
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                {filteredOrders.length} of {orders.length}
              </p>
            </div>
            <div className="flex h-11 items-center border border-neutral-800 px-3 md:w-96">
              <Search size={15} className="text-neutral-500" />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="SEARCH ORDERS"
                className="h-full w-full bg-transparent pl-3 text-xs uppercase tracking-[0.2em] text-white outline-none placeholder:text-neutral-600"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="mt-6 space-y-3">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-28 animate-pulse bg-neutral-900" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-neutral-800 border-y border-neutral-800">
              {filteredOrders.map(order => {
                const isExpanded = expandedOrderId === order.id;

                return (
                  <article key={order.id} className="py-5">
                    <div className="grid gap-4 md:grid-cols-[1.2fr_1fr_0.7fr_0.8fr_0.8fr_auto] md:items-center">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Order</p>
                        <p className="mt-1 truncate text-sm font-bold uppercase tracking-[0.15em] text-white">
                          {order.id}
                        </p>
                        <p className="mt-2 text-xs text-neutral-500">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Customer</p>
                        <p className="mt-1 truncate text-sm text-neutral-200">{order.customer.name}</p>
                        <p className="mt-1 truncate text-xs text-neutral-500">{order.customer.email}</p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Items</p>
                        <p className="mt-1 text-sm text-neutral-200">{itemCount(order)}</p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Total</p>
                        <p className="mt-1 font-headline text-2xl text-white">{formatMoney(order.total)}</p>
                      </div>

                      <label className="space-y-2">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Status</span>
                        <select
                          value={order.status}
                          onChange={event => handleStatusChange(order.id, event.target.value as OrderStatus)}
                          disabled={updateStatus.isPending}
                          className="h-10 w-full border border-neutral-800 bg-[#131313] px-3 text-xs uppercase tracking-[0.15em] text-white outline-none transition-colors focus:border-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {statuses.map(status => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </label>

                      <button
                        type="button"
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className="flex h-10 w-10 items-center justify-center border border-neutral-700 text-neutral-300 transition-colors hover:border-white hover:text-white"
                        title={isExpanded ? 'Hide details' : 'Show details'}
                      >
                        <ChevronDown size={16} className={isExpanded ? 'rotate-180 transition-transform' : 'transition-transform'} />
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-6 grid gap-6 border-t border-neutral-800 pt-6 lg:grid-cols-[1fr_340px]">
                        <div className="divide-y divide-neutral-800">
                          {order.items.map(item => (
                            <div key={item.id} className="flex gap-5 py-4 first:pt-0 last:pb-0">
                              <div className="h-24 w-20 flex-shrink-0 overflow-hidden bg-neutral-900">
                                <img
                                  src={item.productImage}
                                  alt={item.productName}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="flex flex-1 flex-col justify-between gap-4 md:flex-row md:items-center">
                                <div>
                                  <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-white">
                                    {item.productName}
                                  </h3>
                                  <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-neutral-500">
                                    Size: {item.selectedSize} / Color: {item.selectedColor} / Qty: {item.quantity}
                                  </p>
                                </div>
                                <p className="text-sm font-bold text-white">
                                  {formatMoney(item.unitPrice * item.quantity)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <aside className="border border-neutral-800 p-5">
                          <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
                            <PackageCheck size={17} className="text-neutral-400" />
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                              Shipping
                            </h3>
                          </div>
                          <div className="space-y-4 pt-5 text-sm leading-6 text-neutral-300">
                            <p>
                              {order.shipping.firstName} {order.shipping.lastName}
                            </p>
                            <p>{order.email}</p>
                            <p>
                              {order.shipping.address}
                              <br />
                              {order.shipping.city}, {order.shipping.postalCode}
                            </p>
                          </div>
                          <dl className="mt-6 space-y-3 border-t border-neutral-800 pt-5 text-xs uppercase tracking-[0.15em]">
                            <div className="flex justify-between text-neutral-500">
                              <dt>Subtotal</dt>
                              <dd>{formatMoney(order.subtotal)}</dd>
                            </div>
                            <div className="flex justify-between text-neutral-500">
                              <dt>Tax</dt>
                              <dd>{formatMoney(order.tax)}</dd>
                            </div>
                            <div className="flex justify-between text-white">
                              <dt>Total</dt>
                              <dd>{formatMoney(order.total)}</dd>
                            </div>
                          </dl>
                        </aside>
                      </div>
                    )}
                  </article>
                );
              })}

              {filteredOrders.length === 0 && (
                <div className="py-16 text-center text-xs uppercase tracking-[0.2em] text-neutral-500">
                  No orders found
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
