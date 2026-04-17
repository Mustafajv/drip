import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useProduct, useRelatedProducts } from '@/hooks/useProducts';
import { useCartStore } from '@/stores/cartStore';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id!);
  const { data: relatedProducts } = useRelatedProducts(id!);
  const addItem = useCartStore(state => state.addItem);

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [openAccordion, setOpenAccordion] = useState<string | null>('description');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#131313]">
        <Navbar />
        <main className="pt-20 min-h-screen flex items-center justify-center">
          <div className="animate-pulse space-y-4 text-center">
            <div className="w-48 h-2 bg-neutral-800 mx-auto" />
            <div className="w-32 h-2 bg-neutral-900 mx-auto" />
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#131313]">
        <Navbar />
        <main className="pt-20 min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="font-headline text-3xl text-white">Product Not Found</h1>
            <Link to="/products" className="text-xs uppercase tracking-widest text-neutral-400 hover:text-white">
              ← Back to Collection
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const handleAddToCart = () => {
    const size = selectedSize || product.sizes[0];
    const color = selectedColor || product.colors[0]?.name || 'Default';
    addItem(product, size, color);
  };

  const toggleAccordion = (key: string) => {
    setOpenAccordion(prev => (prev === key ? null : key));
  };

  return (
    <div className="min-h-screen bg-[#131313]">
      <Navbar />

      <main className="pt-20 min-h-screen">
        <div className="flex flex-col md:flex-row w-full">
          {/* Image Gallery */}
          <div className="md:w-3/5 lg:w-2/3 md:sticky md:top-20 md:h-[calc(100vh-5rem)] overflow-hidden">
            <div className="flex flex-col h-full gap-1">
              {product.images.slice(0, 1).map((img, i) => (
                <img
                  key={i}
                  className="w-full h-full object-cover object-center"
                  src={img}
                  alt={`${product.name} view ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Product Info Sidebar */}
          <div className="md:w-2/5 lg:w-1/3 md:h-[calc(100vh-5rem)] md:sticky md:top-20 overflow-y-auto px-6 lg:px-16 py-12 bg-[#131313]">
            <div className="max-w-md mx-auto space-y-10">
              <header className="space-y-4">
                <p className="text-neutral-500 font-sans text-xs tracking-[0.2em] uppercase">
                  {product.collection}
                </p>
                <h1 className="font-headline text-4xl lg:text-5xl xl:text-6xl text-white leading-none tracking-tighter uppercase">
                  {product.name.split(' ').map((word, i) => (
                    <span key={i}>
                      {word}
                      {i < product.name.split(' ').length - 1 && <br />}
                    </span>
                  ))}
                </h1>
                <p className="text-2xl font-sans font-light text-neutral-300">
                  ${product.price.toLocaleString()}.00
                </p>
              </header>

              <div className="space-y-6">
                {/* Size Selector */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase tracking-widest text-neutral-400">
                      Select Size
                    </span>
                    <button className="text-xs uppercase tracking-widest text-white underline underline-offset-4">
                      Size Guide
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`h-12 flex items-center justify-center border transition-all text-sm ${
                          selectedSize === size ||
                          (!selectedSize && size === product.sizes[0])
                            ? 'border-white text-white bg-neutral-800'
                            : 'border-neutral-700 text-neutral-400 hover:border-white hover:text-white'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selector */}
                {product.colors.length > 1 && (
                  <div className="space-y-3">
                    <span className="text-xs uppercase tracking-widest text-neutral-400 block">
                      Color: {selectedColor || product.colors[0]?.name}
                    </span>
                    <div className="flex gap-3">
                      {product.colors.map(color => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(color.name)}
                          className={`w-8 h-8 border transition-all ${
                            selectedColor === color.name ||
                            (!selectedColor && color.name === product.colors[0]?.name)
                              ? 'ring-1 ring-offset-2 ring-offset-[#131313] ring-white border-white'
                              : 'border-neutral-700 hover:border-white'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Add to Bag */}
                <button
                  onClick={handleAddToCart}
                  className="w-full py-5 bg-white text-black font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity active:scale-[0.98]"
                >
                  Add to bag
                </button>

                {/* Add to Wishlist */}
                <button className="w-full py-5 border border-neutral-700 text-white font-bold uppercase tracking-widest text-sm hover:border-white transition-all active:scale-[0.98]">
                  Add to wishlist
                </button>
              </div>

              {/* Accordion Details */}
              <div className="space-y-0 pt-8 border-t border-neutral-800/50">
                {/* Description */}
                <div className="border-b border-neutral-800/30">
                  <button
                    onClick={() => toggleAccordion('description')}
                    className="flex justify-between items-center w-full cursor-pointer py-4 text-xs uppercase tracking-[0.2em] text-white"
                  >
                    Description
                    <span
                      className={`material-symbols-outlined text-sm transition-transform ${
                        openAccordion === 'description' ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                  {openAccordion === 'description' && (
                    <div className="pb-4 text-sm text-neutral-400 leading-relaxed font-light">
                      {product.longDescription}
                    </div>
                  )}
                </div>

                {/* Materials & Care */}
                <div className="border-b border-neutral-800/30">
                  <button
                    onClick={() => toggleAccordion('materials')}
                    className="flex justify-between items-center w-full cursor-pointer py-4 text-xs uppercase tracking-[0.2em] text-white"
                  >
                    Materials & Care
                    <span
                      className={`material-symbols-outlined text-sm transition-transform ${
                        openAccordion === 'materials' ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                  {openAccordion === 'materials' && (
                    <div className="pb-4 text-sm text-neutral-400 leading-relaxed font-light space-y-2">
                      <p>{product.materials}</p>
                      <p>{product.care}</p>
                    </div>
                  )}
                </div>

                {/* Shipping */}
                <div className="border-b border-neutral-800/30">
                  <button
                    onClick={() => toggleAccordion('shipping')}
                    className="flex justify-between items-center w-full cursor-pointer py-4 text-xs uppercase tracking-[0.2em] text-white"
                  >
                    Shipping & Returns
                    <span
                      className={`material-symbols-outlined text-sm transition-transform ${
                        openAccordion === 'shipping' ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                  {openAccordion === 'shipping' && (
                    <div className="pb-4 text-sm text-neutral-400 leading-relaxed font-light">
                      Complimentary standard shipping on all orders over $500. Returns
                      accepted within 14 days of delivery.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-[#0e0e0e]">
            <div className="max-w-[1920px] mx-auto">
              <div className="flex justify-between items-end mb-12 md:mb-16">
                <h2 className="font-headline text-3xl lg:text-4xl xl:text-5xl text-white tracking-tight">
                  COMPLETE THE LOOK
                </h2>
                <Link
                  to="/products"
                  className="text-xs uppercase tracking-[0.2em] text-neutral-400 hover:text-white transition-colors border-b border-neutral-700 pb-1"
                >
                  Shop all collection
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedProducts.map(related => (
                  <Link
                    key={related.id}
                    to={`/products/${related.id}`}
                    className="group cursor-pointer"
                  >
                    <div className="relative overflow-hidden mb-6 aspect-[3/4]">
                      <img
                        className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                        src={related.images[0]}
                        alt={related.name}
                      />
                      <div className="absolute inset-0 bg-neutral-950/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xs uppercase tracking-widest text-white">
                        {related.name}
                      </h3>
                      <p className="text-sm text-neutral-500 font-light">
                        ${related.price.toLocaleString()}.00
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
