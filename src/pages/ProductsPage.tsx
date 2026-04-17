import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useProducts } from '@/hooks/useProducts';
import { lookbookImage } from '@/data/products';

const categories = ['outerwear', 'knitwear', 'footwear', 'accessories', 'trousers'];
const sizes = ['XS', 'S', 'M', 'L', 'XL'];
const colorSwatches = [
  { name: 'Void Black', hex: '#000000' },
  { name: 'Charcoal', hex: '#2a2a2a' },
  { name: 'Stone', hex: '#e2e2e2' },
  { name: 'Ash', hex: '#474747' },
];

export default function ProductsPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);

  const filters = useMemo(
    () => ({
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
      colors: selectedColors.length > 0 ? selectedColors : undefined,
      maxPrice: maxPrice < 5000 ? maxPrice : undefined,
      search: search || undefined,
    }),
    [selectedCategories, selectedSizes, selectedColors, maxPrice, search]
  );

  const { data: allProducts, isLoading } = useProducts(filters);
  const displayedProducts = allProducts?.slice(0, visibleCount) ?? [];
  const hasMore = (allProducts?.length ?? 0) > visibleCount;

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  return (
    <div className="min-h-screen bg-[#131313]">
      <Navbar />

      <main className="pt-32 px-6 md:px-12 min-h-screen max-w-[1920px] mx-auto flex flex-col md:flex-row gap-12 md:gap-16">
        {/* Filter Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0 md:sticky md:top-32 md:h-fit space-y-12">
          {/* Category */}
          <div className="space-y-4">
            <h3 className="font-headline text-[10px] uppercase tracking-[0.2em] text-neutral-500">
              Category
            </h3>
            <div className="space-y-3">
              {categories.map(cat => (
                <label key={cat} className="flex items-center group cursor-pointer">
                  <input
                    type="checkbox"
                    className="hidden peer"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                  />
                  <div className={`w-4 h-4 border mr-3 transition-colors ${
                    selectedCategories.includes(cat) ? 'bg-white border-white' : 'border-neutral-700'
                  }`} />
                  <span className={`text-xs uppercase tracking-widest transition-colors group-hover:text-white ${
                    selectedCategories.includes(cat) ? 'text-white' : 'text-neutral-500'
                  }`}>
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="space-y-4">
            <h3 className="font-headline text-[10px] uppercase tracking-[0.2em] text-neutral-500">
              Size
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {sizes.map(size => (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`py-2 border text-[10px] uppercase tracking-tighter transition-colors ${
                    selectedSizes.includes(size)
                      ? 'border-white bg-white text-black'
                      : 'border-neutral-700 text-neutral-500 hover:border-white hover:text-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="space-y-4">
            <h3 className="font-headline text-[10px] uppercase tracking-[0.2em] text-neutral-500">
              Color
            </h3>
            <div className="flex flex-wrap gap-3">
              {colorSwatches.map(color => (
                <button
                  key={color.name}
                  onClick={() => toggleColor(color.name)}
                  className={`w-6 h-6 border transition-all ${
                    selectedColors.includes(color.name)
                      ? 'ring-1 ring-offset-2 ring-offset-[#131313] ring-white border-white'
                      : 'border-neutral-700 hover:border-white'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <h3 className="font-headline text-[10px] uppercase tracking-[0.2em] text-neutral-500">
              Price Range
            </h3>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="5000"
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full accent-white h-[1px] bg-neutral-700 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="flex justify-between text-[10px] uppercase tracking-widest text-neutral-500">
                <span>$0</span>
                <span className="text-white">${maxPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <section className="flex-grow space-y-16 pb-20">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-neutral-700/30 pb-8">
            <div className="space-y-2">
              <h1 className="font-headline text-4xl md:text-5xl tracking-tighter italic">
                The Collection
              </h1>
              <p className="text-xs uppercase tracking-[0.4em] text-neutral-500">
                Showing {allProducts?.length ?? 0} Artifacts
              </p>
            </div>
            <div className="flex items-center border-b border-neutral-700 w-full md:w-72 pb-2">
              <span className="material-symbols-outlined text-neutral-500">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 text-xs tracking-[0.2em] placeholder:text-neutral-600 w-full uppercase pl-3"
                placeholder="SEARCH PIECES..."
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </header>

          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-neutral-900" />
                  <div className="mt-3 space-y-2">
                    <div className="h-3 bg-neutral-800 w-3/4" />
                    <div className="h-2 bg-neutral-900 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10">
              {displayedProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-square overflow-hidden bg-neutral-900">
                    <img
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      src={product.images[0]}
                    />
                    <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <span className="px-3 py-1.5 bg-white text-black text-[9px] tracking-[0.2em] uppercase">
                        Quick Add
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-start gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <h2 className="text-[11px] uppercase tracking-widest font-bold text-white truncate">
                        {product.name}
                      </h2>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-wider truncate">
                        {product.description}
                      </p>
                    </div>
                    <span className="text-xs font-headline flex-shrink-0">${product.price}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {hasMore && (
            <footer className="pt-20 pb-20 md:pb-40 flex justify-center">
              <button
                onClick={() => setVisibleCount(prev => prev + 12)}
                className="px-12 py-4 border border-neutral-700 hover:border-white transition-all duration-500 text-[10px] uppercase tracking-[0.3em]"
              >
                Load More Pieces
              </button>
            </footer>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
