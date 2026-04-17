import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCartStore } from '@/stores/cartStore';
import { usePlaceOrder } from '@/hooks/useCart';

const checkoutSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  cardNumber: z
    .string()
    .min(13, 'Card number must be at least 13 digits')
    .max(19, 'Card number is too long'),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Use MM/YY format'),
  cvv: z.string().min(3, 'CVV must be 3-4 digits').max(4),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore(state => state.items);
  const subtotal = useCartStore(state => state.subtotal);
  const tax = useCartStore(state => state.tax);
  const total = useCartStore(state => state.total);
  const placeOrder = usePlaceOrder();
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'apple_pay'>('credit_card');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      await placeOrder.mutateAsync({
        ...data,
        paymentMethod,
      });
      navigate('/');
    } catch {
      // Error handled by mutation
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#131313]">
        <Navbar />
        <main className="pt-32 min-h-screen flex items-center justify-center">
          <div className="text-center space-y-6">
            <span className="material-symbols-outlined text-neutral-700 text-6xl">
              shopping_bag
            </span>
            <h1 className="font-headline text-3xl text-white">Your bag is empty</h1>
            <p className="text-neutral-500 text-sm">
              Add items to your bag to proceed to checkout.
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-white text-black px-10 py-4 font-label text-xs uppercase tracking-widest hover:bg-neutral-200 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#131313]">
      <Navbar />

      <main className="pt-32 pb-20 px-6 md:px-12 max-w-[1920px] mx-auto min-h-screen">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Checkout Form */}
            <div className="lg:col-span-7 flex flex-col gap-12 lg:gap-16">
              <header>
                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-white">
                  CHECKOUT
                </h1>
                <p className="text-neutral-500 text-sm tracking-widest uppercase font-medium">
                  Step 2 of 3: Details & Payment
                </p>
              </header>

              {/* Shipping Section */}
              <section className="flex flex-col gap-8 md:gap-10">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-headline italic text-white">01</span>
                  <h2 className="font-headline text-xl uppercase tracking-widest border-b border-neutral-700 pb-1">
                    Shipping Information
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 md:gap-y-12">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">
                      First Name
                    </label>
                    <input
                      {...register('firstName')}
                      className="bg-transparent border-t-0 border-x-0 border-b border-neutral-700 px-0 py-2 text-white focus:ring-0 focus:border-white transition-colors"
                      placeholder="Alexander"
                    />
                    {errors.firstName && (
                      <span className="text-red-400 text-[10px] uppercase tracking-wider">
                        {errors.firstName.message}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">
                      Last Name
                    </label>
                    <input
                      {...register('lastName')}
                      className="bg-transparent border-t-0 border-x-0 border-b border-neutral-700 px-0 py-2 text-white focus:ring-0 focus:border-white transition-colors"
                      placeholder="McQueen"
                    />
                    {errors.lastName && (
                      <span className="text-red-400 text-[10px] uppercase tracking-wider">
                        {errors.lastName.message}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">
                      Email
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      className="bg-transparent border-t-0 border-x-0 border-b border-neutral-700 px-0 py-2 text-white focus:ring-0 focus:border-white transition-colors"
                      placeholder="alexander@drip.com"
                    />
                    {errors.email && (
                      <span className="text-red-400 text-[10px] uppercase tracking-wider">
                        {errors.email.message}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2" />
                  <div className="md:col-span-2 flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">
                      Address
                    </label>
                    <input
                      {...register('address')}
                      className="bg-transparent border-t-0 border-x-0 border-b border-neutral-700 px-0 py-2 text-white focus:ring-0 focus:border-white transition-colors"
                      placeholder="72 Bruton St, London W1J 6PT"
                    />
                    {errors.address && (
                      <span className="text-red-400 text-[10px] uppercase tracking-wider">
                        {errors.address.message}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">
                      City
                    </label>
                    <input
                      {...register('city')}
                      className="bg-transparent border-t-0 border-x-0 border-b border-neutral-700 px-0 py-2 text-white focus:ring-0 focus:border-white transition-colors"
                      placeholder="London"
                    />
                    {errors.city && (
                      <span className="text-red-400 text-[10px] uppercase tracking-wider">
                        {errors.city.message}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">
                      Postal Code
                    </label>
                    <input
                      {...register('postalCode')}
                      className="bg-transparent border-t-0 border-x-0 border-b border-neutral-700 px-0 py-2 text-white focus:ring-0 focus:border-white transition-colors"
                      placeholder="W1J 6PT"
                    />
                    {errors.postalCode && (
                      <span className="text-red-400 text-[10px] uppercase tracking-wider">
                        {errors.postalCode.message}
                      </span>
                    )}
                  </div>
                </div>
              </section>

              {/* Payment Section */}
              <section className="flex flex-col gap-8 md:gap-10">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-headline italic text-white">02</span>
                  <h2 className="font-headline text-xl uppercase tracking-widest border-b border-neutral-700 pb-1">
                    Payment Method
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-8 mb-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`flex items-center justify-center gap-3 py-6 bg-[#1f1f1f] border transition-all ${
                      paymentMethod === 'credit_card'
                        ? 'border-white text-white'
                        : 'border-transparent text-neutral-500 hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">credit_card</span>
                    <span className="text-[10px] uppercase tracking-widest font-bold">
                      Credit Card
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('apple_pay')}
                    className={`flex items-center justify-center gap-3 py-6 bg-[#1f1f1f] border transition-all ${
                      paymentMethod === 'apple_pay'
                        ? 'border-white text-white'
                        : 'border-transparent text-neutral-500 hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      account_balance_wallet
                    </span>
                    <span className="text-[10px] uppercase tracking-widest font-bold">
                      Apple Pay
                    </span>
                  </button>
                </div>

                {paymentMethod === 'credit_card' && (
                  <div className="flex flex-col gap-10 md:gap-12 bg-[#1b1b1b] p-6 md:p-8 border border-neutral-800/10">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          {...register('cardNumber')}
                          className="w-full bg-transparent border-t-0 border-x-0 border-b border-neutral-700 px-0 py-2 text-white focus:ring-0 focus:border-white transition-colors pr-10"
                          placeholder="0000 0000 0000 0000"
                        />
                        <span className="absolute right-0 bottom-2 material-symbols-outlined text-neutral-500">
                          lock
                        </span>
                      </div>
                      {errors.cardNumber && (
                        <span className="text-red-400 text-[10px] uppercase tracking-wider">
                          {errors.cardNumber.message}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">
                          Expiry Date
                        </label>
                        <input
                          {...register('expiryDate')}
                          className="bg-transparent border-t-0 border-x-0 border-b border-neutral-700 px-0 py-2 text-white focus:ring-0 focus:border-white transition-colors"
                          placeholder="MM/YY"
                        />
                        {errors.expiryDate && (
                          <span className="text-red-400 text-[10px] uppercase tracking-wider">
                            {errors.expiryDate.message}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">
                          CVV
                        </label>
                        <input
                          {...register('cvv')}
                          className="bg-transparent border-t-0 border-x-0 border-b border-neutral-700 px-0 py-2 text-white focus:ring-0 focus:border-white transition-colors"
                          placeholder="123"
                        />
                        {errors.cvv && (
                          <span className="text-red-400 text-[10px] uppercase tracking-wider">
                            {errors.cvv.message}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Submit */}
              <div className="pt-8 flex flex-col gap-6">
                <p className="text-neutral-500 text-xs leading-relaxed max-w-lg">
                  By clicking "Complete Transaction", you agree to DRIP Atelier's terms of
                  service and privacy policy regarding artisanal manufacturing cycles.
                </p>
                <button
                  type="submit"
                  disabled={placeOrder.isPending}
                  className="group relative w-full bg-white py-7 md:py-8 text-black font-bold uppercase tracking-[0.3em] overflow-hidden transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <span className="relative z-10">
                    {placeOrder.isPending ? 'Processing...' : 'Complete Transaction'}
                  </span>
                  <div className="absolute inset-0 bg-neutral-200 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <aside className="lg:col-span-5 relative order-first lg:order-last">
              <div className="lg:sticky lg:top-32 bg-[#0e0e0e] p-8 md:p-12 border border-neutral-800/10">
                <h3 className="font-headline text-2xl mb-10 md:mb-12 tracking-tight text-white uppercase italic">
                  Order Manifest
                </h3>
                <div className="flex flex-col gap-8 md:gap-10">
                  {/* Product Items */}
                  {items.map(item => (
                    <div key={item.id} className="flex gap-5 md:gap-6 group">
                      <div className="w-20 md:w-24 h-28 md:h-32 flex-shrink-0 overflow-hidden bg-neutral-900">
                        <img
                          alt={item.product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          src={item.product.images[0]}
                        />
                      </div>
                      <div className="flex flex-col justify-between py-1 flex-grow">
                        <div>
                          <h4 className="text-white text-sm font-bold uppercase tracking-widest mb-1">
                            {item.product.name}
                          </h4>
                          <p className="text-neutral-500 text-[10px] uppercase tracking-wider">
                            Size: {item.selectedSize} • Color: {item.selectedColor}
                          </p>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-xs text-neutral-500 tracking-widest">
                            QTY: {item.quantity}
                          </span>
                          <span className="text-white font-bold text-sm tracking-widest">
                            ${(item.product.price * item.quantity).toLocaleString()}.00
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Totals */}
                  <div className="mt-8 md:mt-10 pt-8 md:pt-10 border-t border-neutral-700/30 flex flex-col gap-4">
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-medium">
                      <span>Subtotal</span>
                      <span className="text-white">${subtotal().toLocaleString()}.00</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-medium">
                      <span>Shipping</span>
                      <span className="text-white">Complimentary</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-medium">
                      <span>VAT (20%)</span>
                      <span className="text-white">${tax().toLocaleString()}.00</span>
                    </div>
                    <div className="flex justify-between items-center pt-6 md:pt-8 mt-4 border-t border-neutral-700/50">
                      <span className="text-xs uppercase tracking-[0.4em] text-white font-bold">
                        Total Due
                      </span>
                      <span className="text-2xl font-headline text-white font-bold tracking-tight">
                        ${total().toLocaleString()}.00
                      </span>
                    </div>
                  </div>

                  {/* Shipping Note */}
                  <div className="flex items-center gap-3 bg-[#1b1b1b] border border-neutral-700 p-4">
                    <span className="material-symbols-outlined text-sm text-neutral-500">
                      local_shipping
                    </span>
                    <p className="text-[9px] uppercase tracking-widest text-neutral-500">
                      Complimentary express shipping applied to your artisan order.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
