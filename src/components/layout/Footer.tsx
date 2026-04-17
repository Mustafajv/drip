import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full border-t border-neutral-800/30 bg-neutral-950">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16 px-6 md:px-24 py-16 md:py-20 w-full max-w-[1920px] mx-auto">
        {/* Brand */}
        <div className="space-y-8">
          <Link to="/" className="text-xl font-headline tracking-widest text-white">
            DRIP
          </Link>
          <p className="text-neutral-500 font-sans text-xs tracking-widest leading-loose uppercase">
            The Architectural Atelier <br /> For The Modern Monolith.
          </p>
        </div>

        {/* Information */}
        <div className="space-y-4">
          <h5 className="text-white font-sans text-xs tracking-[0.2em] uppercase mb-6 md:mb-8">
            Information
          </h5>
          <nav className="flex flex-col gap-4">
            <a className="font-sans text-xs tracking-[0.1em] text-neutral-500 hover:text-white transition-colors cursor-pointer" href="#">
              Sustainability
            </a>
            <a className="font-sans text-xs tracking-[0.1em] text-neutral-500 hover:text-white transition-colors cursor-pointer" href="#">
              Shipping
            </a>
            <a className="font-sans text-xs tracking-[0.1em] text-neutral-500 hover:text-white transition-colors cursor-pointer" href="#">
              Returns
            </a>
          </nav>
        </div>

        {/* Company */}
        <div className="space-y-4">
          <h5 className="text-white font-sans text-xs tracking-[0.2em] uppercase mb-6 md:mb-8">
            Company
          </h5>
          <nav className="flex flex-col gap-4">
            <a className="font-sans text-xs tracking-[0.1em] text-neutral-500 hover:text-white transition-colors cursor-pointer" href="#">
              Contact
            </a>
            <a className="font-sans text-xs tracking-[0.1em] text-neutral-500 hover:text-white transition-colors cursor-pointer" href="#">
              Privacy Policy
            </a>
            <a className="font-sans text-xs tracking-[0.1em] text-neutral-500 hover:text-white transition-colors cursor-pointer" href="#">
              Terms of Service
            </a>
          </nav>
        </div>

        {/* Social */}
        <div className="space-y-4">
          <h5 className="text-white font-sans text-xs tracking-[0.2em] uppercase mb-6 md:mb-8">
            Social
          </h5>
          <nav className="flex flex-col gap-4">
            <a className="font-sans text-xs tracking-[0.1em] text-neutral-500 hover:text-white transition-colors cursor-pointer" href="#">
              Instagram
            </a>
            <a className="font-sans text-xs tracking-[0.1em] text-neutral-500 hover:text-white transition-colors cursor-pointer" href="#">
              Pinterest
            </a>
            <a className="font-sans text-xs tracking-[0.1em] text-neutral-500 hover:text-white transition-colors cursor-pointer" href="#">
              TikTok
            </a>
          </nav>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="px-6 md:px-24 py-8 md:py-12 border-t border-neutral-900 flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="font-sans text-[10px] tracking-[0.2em] text-neutral-600 uppercase">
          © 2024 DRIP ATELIER. ALL RIGHTS RESERVED.
        </span>
        <div className="flex gap-8">
          <span className="material-symbols-outlined text-neutral-700 text-sm">language</span>
          <span className="font-sans text-[10px] tracking-[0.2em] text-neutral-600 uppercase">
            United States (USD)
          </span>
        </div>
      </div>
    </footer>
  );
}
