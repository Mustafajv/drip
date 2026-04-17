import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';

export default function CartDrawer() {
  const navigate = useNavigate();
  const isOpen = useCartStore(state => state.isOpen);
  const closeCart = useCartStore(state => state.closeCart);
  const items = useCartStore(state => state.items);
  const removeItem = useCartStore(state => state.removeItem);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const subtotal = useCartStore(state => state.subtotal);
  const totalItems = useCartStore(state => state.totalItems);

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="w-full sm:max-w-lg bg-[#0e0e0e] border-l border-neutral-800/30 p-0 flex flex-col">
        <SheetHeader className="px-8 pt-8 pb-6 border-b border-neutral-800/30">
          <SheetTitle className="font-headline text-2xl text-white tracking-tight flex items-center justify-between">
            <span>Your Bag</span>
            <span className="text-xs font-body text-neutral-500 tracking-widest uppercase">
              {totalItems()} {totalItems() === 1 ? 'item' : 'items'}
            </span>
          </SheetTitle>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-6">
              <span className="material-symbols-outlined text-neutral-700 text-5xl">
                shopping_bag
              </span>
              <div>
                <p className="text-neutral-400 text-sm mb-1">Your bag is empty</p>
                <p className="text-neutral-600 text-xs tracking-widest uppercase">
                  Explore the collection
                </p>
              </div>
              <Button
                onClick={() => {
                  closeCart();
                  navigate('/products');
                }}
                className="bg-white text-black hover:bg-neutral-200 font-label text-xs uppercase tracking-widest px-8 py-3"
              >
                Shop Now
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {items.map(item => (
                <div key={item.id} className="flex gap-5 group">
                  {/* Thumbnail */}
                  <div className="w-20 h-28 flex-shrink-0 overflow-hidden bg-neutral-900">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex flex-col justify-between py-0.5 flex-grow min-w-0">
                    <div>
                      <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-0.5 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-neutral-500 text-[10px] uppercase tracking-wider">
                        Size: {item.selectedSize} • {item.selectedColor}
                      </p>
                    </div>

                    <div className="flex justify-between items-end">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 border border-neutral-700 text-neutral-400 hover:border-white hover:text-white transition-colors flex items-center justify-center text-xs"
                        >
                          −
                        </button>
                        <span className="text-xs text-white w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 border border-neutral-700 text-neutral-400 hover:border-white hover:text-white transition-colors flex items-center justify-center text-xs"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-white text-sm font-bold tracking-widest">
                          ${(item.product.price * item.quantity).toLocaleString()}.00
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-neutral-600 hover:text-white transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-8 py-8 border-t border-neutral-800/30 space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase tracking-[0.3em] text-neutral-400">
                Subtotal
              </span>
              <span className="text-lg font-headline text-white">
                ${subtotal().toLocaleString()}.00
              </span>
            </div>
            <p className="text-[10px] text-neutral-600 tracking-wider uppercase">
              Shipping & taxes calculated at checkout
            </p>
            <Button
              onClick={handleCheckout}
              className="w-full py-6 bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-[0.2em] text-xs active:scale-[0.98] transition-all"
            >
              Proceed to Checkout
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
