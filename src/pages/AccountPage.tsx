import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useSession } from '@/lib/auth-client';
import { useOrders } from '@/hooks/useOrders';

export default function AccountPage() {
  const { data: session } = useSession();
  const { data: orders = [], isLoading } = useOrders();

  return (
    <div className="min-h-screen bg-[#131313]">
      <Navbar />

      <main className="pt-28 px-6 md:px-12 pb-20 max-w-[1440px] mx-auto min-h-screen">
        <header className="border-b border-neutral-800 pb-8">
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Customer Account</p>
          <h1 className="mt-2 font-headline text-4xl uppercase tracking-tight text-white md:text-5xl">
            Order History
          </h1>
          <div className="mt-6 text-xs uppercase tracking-[0.2em] text-neutral-500">
            <p className="text-white">{session?.user.name}</p>
            <p className="mt-1">{session?.user.email}</p>
          </div>
        </header>

        <section className="pt-10">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-40 animate-pulse bg-neutral-900" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center border border-neutral-800 text-center">
              <span className="material-symbols-outlined text-5xl text-neutral-700">
                receipt_long
              </span>
              <h2 className="mt-6 font-headline text-3xl text-white">No orders yet</h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-neutral-500">
                Your completed orders will appear here after checkout.
              </p>
              <Link
                to="/products"
                className="mt-8 bg-white px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] text-black transition-opacity hover:opacity-90"
              >
                Shop Collection
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <article key={order.id} className="border border-neutral-800 bg-[#101010]">
                  <header className="grid gap-4 border-b border-neutral-800 p-5 md:grid-cols-4 md:items-center md:p-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Order</p>
                      <p className="mt-1 text-sm font-bold uppercase tracking-[0.15em] text-white">
                        {order.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Date</p>
                      <p className="mt-1 text-sm text-neutral-300">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Status</p>
                      <p className="mt-1 text-sm uppercase tracking-[0.15em] text-neutral-300">
                        {order.status}
                      </p>
                    </div>
                    <div className="md:text-right">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Total</p>
                      <p className="mt-1 font-headline text-2xl text-white">
                        ${order.total.toLocaleString()}.00
                      </p>
                    </div>
                  </header>

                  <div className="divide-y divide-neutral-800">
                    {order.items.map(item => (
                      <div key={item.id} className="flex gap-5 p-5 md:p-6">
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
                            ${(item.unitPrice * item.quantity).toLocaleString()}.00
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <footer className="border-t border-neutral-800 p-5 text-xs uppercase tracking-[0.15em] text-neutral-500 md:p-6">
                    Shipping to {order.shipping.firstName} {order.shipping.lastName}, {order.shipping.city}
                  </footer>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
