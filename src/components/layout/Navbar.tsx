import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';
import { useSession, signOut } from '@/lib/auth-client';

const navLinks = [
  { label: 'Shop', path: '/products' },
  { label: 'Men', path: '/products?category=men' },
  { label: 'Women', path: '/products?category=women' },
  { label: 'About', path: '/about' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const openCart = useCartStore(state => state.openCart);
  const totalItems = useCartStore(state => state.totalItems);
  const count = totalItems();

  const { data: session, isPending } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setShowDropdown(false);
    navigate('/');
  };

  const userInitial = session?.user?.name?.charAt(0).toUpperCase() || '?';

  return (
    <nav className="fixed top-0 w-full z-50 h-20 bg-neutral-950/80 backdrop-blur-xl flex justify-between items-center px-6 md:px-12 max-w-[1920px] mx-auto left-0 right-0">
      {/* Left Nav Links */}
      <div className="flex gap-4 md:gap-8 items-center">
        {navLinks.map(link => {
          const isActive = location.pathname === link.path ||
            (link.path === '/products' && location.pathname === '/products');
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`font-sans text-xs tracking-widest uppercase transition-colors duration-300 ${
                isActive
                  ? 'text-white border-b border-white pb-1'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Center Logo */}
      <Link
        to="/"
        className="text-3xl font-headline tracking-[0.2em] text-white absolute left-1/2 -translate-x-1/2"
      >
        DRIP
      </Link>

      {/* Right Icons */}
      <div className="flex gap-4 md:gap-6 items-center">
        <button className="text-neutral-400 hover:text-white transition-all duration-500 active:opacity-80">
          <span className="material-symbols-outlined">search</span>
        </button>

        {/* Auth Button */}
        {isPending ? (
          <div className="w-5 h-5 border border-neutral-700 animate-pulse" />
        ) : session?.user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`w-7 h-7 flex items-center justify-center text-xs font-bold uppercase hover:opacity-80 transition-opacity overflow-hidden rounded-full ${
                session.user.image ? '' : 'bg-white text-black'
              }`}
              title={session.user.name || session.user.email}
            >
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || ''}
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                userInitial
              )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 top-full mt-3 w-56 bg-[#1a1a1a] border border-neutral-800 shadow-2xl z-50">
                <div className="px-4 py-4 border-b border-neutral-800/50">
                  <p className="text-white text-xs font-bold uppercase tracking-widest truncate">
                    {session.user.name}
                  </p>
                  <p className="text-neutral-500 text-[10px] tracking-wider mt-1 truncate">
                    {session.user.email}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-3 text-xs uppercase tracking-widest text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/auth"
            className="text-neutral-400 hover:text-white transition-all duration-500 active:opacity-80"
          >
            <span className="material-symbols-outlined">person</span>
          </Link>
        )}

        {/* Cart */}
        <button
          onClick={openCart}
          className="text-neutral-400 hover:text-white transition-all duration-500 active:opacity-80 relative"
        >
          <span className="material-symbols-outlined">shopping_bag</span>
          {count > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white text-black text-[9px] flex items-center justify-center font-bold">
              {count}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
