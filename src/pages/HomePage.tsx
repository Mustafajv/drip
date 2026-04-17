import { Link } from 'react-router-dom';
import { heroImage } from '@/data/products';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { products, featuredCollectionImage } from '@/data/products';

export default function HomePage() {
  const featuredProducts = [products[0], products[1], products[2]];

  return (
    <div className="min-h-screen bg-[#131313]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover brightness-[0.4]"
            src={heroImage}
            alt="Editorial fashion photography"
          />
        </div>
        <div className="relative z-10 text-center max-w-4xl px-6">
          <span className="block font-label text-xs tracking-[0.4em] uppercase mb-6 text-neutral-400">
            Collection MMXXIV
          </span>
          <h1 className="font-headline text-6xl md:text-8xl lg:text-9xl text-white italic tracking-tighter leading-none mb-12">
            The New Standard
          </h1>
          <div className="flex justify-center gap-12">
            <Link
              to="/products"
              className="bg-white text-black px-10 md:px-12 py-4 font-label text-xs uppercase tracking-widest hover:bg-neutral-200 transition-colors inline-block"
            >
              Explore Now
            </Link>
          </div>
        </div>
        <div className="absolute bottom-12 left-6 md:left-12 flex items-center gap-4">
          <div className="h-[1px] w-12 bg-neutral-700" />
          <span className="font-label text-[10px] tracking-widest uppercase text-neutral-500">
            Scroll to explore
          </span>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 md:py-32 px-6 md:px-12 bg-[#131313]">
        <div className="max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-end">
          <div className="md:col-span-7">
            <h2 className="font-headline text-4xl md:text-5xl lg:text-7xl text-white leading-[1.1] mb-8 md:mb-12">
              Beyond the fabric, <br /> lies the <span className="italic">philosophy</span> of form.
            </h2>
          </div>
          <div className="md:col-span-5 pb-4">
            <p className="font-body text-base md:text-lg text-neutral-400 leading-relaxed max-w-md">
              DRIP ATELIER is a testament to the obsidian monolith—a curation of pieces
              that demand authority through silence. We reject the ephemeral in favor of
              the eternal.
            </p>
            <div className="mt-8">
              <Link
                to="/products"
                className="font-label text-xs uppercase tracking-widest text-white border-b border-white pb-2 inline-block hover:opacity-70 transition-opacity"
              >
                Read the Manifesto
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collection Grid */}
      <section className="py-16 md:py-24 bg-[#0e0e0e]">
        <div className="px-6 md:px-12 max-w-[1920px] mx-auto">
          <div className="flex justify-between items-baseline mb-16 md:mb-24">
            <h3 className="font-headline text-3xl md:text-4xl text-white">Curated Selection</h3>
            <span className="font-label text-xs tracking-widest text-neutral-500">01 / 04</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
            {/* Large Feature Card */}
            <Link to={`/products/${featuredProducts[0].id}`} className="md:col-span-8 group cursor-pointer">
              <div className="aspect-[16/9] overflow-hidden relative mb-6">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={featuredCollectionImage}
                  alt={featuredProducts[0].name}
                />
                <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:opacity-0" />
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-headline text-xl md:text-2xl text-white">{featuredProducts[0].name}</h4>
                  <p className="font-body text-sm text-neutral-500 uppercase tracking-widest mt-1">
                    {featuredProducts[0].isLimited ? 'Limited Edition' : featuredProducts[0].description}
                  </p>
                </div>
                <span className="font-body text-lg md:text-xl text-white">
                  ${featuredProducts[0].price.toLocaleString()}
                </span>
              </div>
            </Link>

            {/* Small Side Card */}
            <Link
              to={`/products/${featuredProducts[1].id}`}
              className="md:col-span-4 group cursor-pointer md:mt-24"
            >
              <div className="aspect-[4/5] overflow-hidden relative mb-6">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={featuredProducts[1].images[0]}
                  alt={featuredProducts[1].name}
                />
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-headline text-xl md:text-2xl text-white">{featuredProducts[1].name}</h4>
                  <p className="font-body text-sm text-neutral-500 uppercase tracking-widest mt-1">
                    {featuredProducts[1].description}
                  </p>
                </div>
                <span className="font-body text-lg md:text-xl text-white">
                  ${featuredProducts[1].price.toLocaleString()}
                </span>
              </div>
            </Link>

            {/* Third Card */}
            <Link
              to={`/products/${featuredProducts[2].id}`}
              className="md:col-span-5 group cursor-pointer md:-mt-12"
            >
              <div className="aspect-square overflow-hidden relative mb-6">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={featuredProducts[2].images[0]}
                  alt={featuredProducts[2].name}
                />
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-headline text-xl md:text-2xl text-white">{featuredProducts[2].name}</h4>
                  <p className="font-body text-sm text-neutral-500 uppercase tracking-widest mt-1">
                    {featuredProducts[2].description}
                  </p>
                </div>
                <span className="font-body text-lg md:text-xl text-white">
                  ${featuredProducts[2].price.toLocaleString()}
                </span>
              </div>
            </Link>

            {/* Quote Interstitial */}
            <div className="md:col-span-7 flex items-center justify-center px-6 md:px-24 py-12 md:py-0">
              <div className="text-center">
                <p className="font-headline text-2xl md:text-3xl italic text-neutral-400 max-w-sm mb-8">
                  "The true luxury of our time is the ability to disappear into one's own
                  identity."
                </p>
                <Link
                  to="/products"
                  className="font-label text-[10px] tracking-[0.3em] uppercase text-white hover:text-neutral-400 transition-colors"
                >
                  View Full Lookbook
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 md:py-40 bg-[#131313]">
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
          <div>
            <h2 className="font-headline text-4xl md:text-5xl text-white mb-8">Join the List</h2>
            <p className="font-body text-neutral-400 max-w-md">
              Subscribers receive early access to limited drops, exclusive atelier
              updates, and private viewing invitations.
            </p>
          </div>
          <div className="relative">
            <form
              className="flex flex-col gap-8"
              onSubmit={e => e.preventDefault()}
            >
              <div className="group border-b border-neutral-700 focus-within:border-white transition-colors">
                <label className="font-label text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">
                  Email Address
                </label>
                <input
                  className="w-full bg-transparent border-none p-0 pb-4 text-white placeholder:text-neutral-700 focus:ring-0 font-body"
                  placeholder="ENTER YOUR EMAIL"
                  type="email"
                />
              </div>
              <button
                className="self-start font-label text-xs uppercase tracking-widest text-white hover:opacity-50 transition-opacity"
                type="submit"
              >
                Request Access →
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
