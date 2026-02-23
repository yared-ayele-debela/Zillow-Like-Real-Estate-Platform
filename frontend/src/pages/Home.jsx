import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MagnifyingGlassIcon,
  HomeIcon,
  BuildingOfficeIcon,
  BuildingOffice2Icon,
  HomeModernIcon,
  MapPinIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  StarIcon,
  UserGroupIcon,
  ChartBarIcon,
  HeartIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChevronDownIcon,
  SparklesIcon,
  CheckCircleIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import useAuthStore from '../store/authStore';
import { propertyService } from '../services/propertyService';

/* ──────────────────── Animated Counter Hook ──────────────────── */
const useCountUp = (end, duration = 2000, startOnView = true) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!startOnView) {
      setHasStarted(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [startOnView, hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [hasStarted, end, duration]);

  return { count, ref };
};

/* ──────────────────── Fade-in on Scroll Hook ──────────────────── */
const useFadeIn = () => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
};

/* ──────────────────── Stat Counter Card ──────────────────── */
const StatCard = ({ stat }) => {
  const { count, ref } = useCountUp(stat.end, 2500);
  return (
    <div ref={ref} className="text-center group">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4 group-hover:bg-white/20 transition-colors">
        <stat.icon className="w-8 h-8 text-white" />
      </div>
      <div className="text-4xl sm:text-5xl font-extrabold text-white">
        {count.toLocaleString()}{stat.suffix}
      </div>
      <div className="mt-2 text-indigo-200 font-medium">{stat.label}</div>
    </div>
  );
};

/* ══════════════════════ HOME COMPONENT ══════════════════════ */
const Home = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Navbar scroll effect
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Fetch featured properties
  const { data: featuredData } = useQuery({
    queryKey: ['featuredProperties'],
    queryFn: () => propertyService.getProperties({ is_featured: 1, per_page: 6 }),
    staleTime: 5 * 60 * 1000,
  });

  const featuredProperties = featuredData?.data || featuredData?.properties?.data || [];

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (propertyType) params.set('property_type', propertyType);
    navigate(`/properties?${params.toString()}`);
  };

  /* ────────── Property Types ────────── */
  const propertyTypes = [
    { name: 'Houses', icon: HomeIcon, value: 'house', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600' },
    { name: 'Apartments', icon: BuildingOfficeIcon, value: 'apartment', color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', text: 'text-purple-600' },
    { name: 'Condos', icon: BuildingOffice2Icon, value: 'condo', color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { name: 'Villas', icon: HomeModernIcon, value: 'villa', color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', text: 'text-amber-600' },
    { name: 'Townhouses', icon: BuildingOffice2Icon, value: 'townhouse', color: 'from-rose-500 to-rose-600', bg: 'bg-rose-50', text: 'text-rose-600' },
    { name: 'Commercial', icon: GlobeAltIcon, value: 'commercial', color: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-50', text: 'text-cyan-600' },
  ];

  /* ────────── How It Works ────────── */
  const steps = [
    { icon: MagnifyingGlassIcon, title: 'Search Properties', desc: 'Browse our extensive catalog of properties with powerful filters for location, price, and amenities.' },
    { icon: HomeIcon, title: 'Find Your Match', desc: 'Explore detailed listings with high-quality photos, virtual tours, price history, and neighborhood data.' },
    { icon: ShieldCheckIcon, title: 'Secure Your Home', desc: 'Connect with verified agents, schedule tours, and close deals with confidence through our secure platform.' },
  ];

  /* ────────── Testimonials ────────── */
  const testimonials = [
    { name: 'Sarah Johnson', role: 'Home Buyer', quote: 'Found my dream home in just two weeks! The search tools and agent communication made everything seamless.', rating: 5, avatar: 'SJ' },
    { name: 'Michael Chen', role: 'Property Investor', quote: 'The analytics and market data helped me make informed investment decisions. Best platform for real estate.', rating: 5, avatar: 'MC' },
    { name: 'Emily Rodriguez', role: 'First-time Buyer', quote: 'As a first-time buyer, I was nervous. The step-by-step guidance and responsive agents made it stress-free!', rating: 5, avatar: 'ER' },
  ];

  /* ────────── Stats ────────── */
  const stats = [
    { label: 'Properties Listed', end: 12500, suffix: '+', icon: HomeIcon },
    { label: 'Happy Clients', end: 8400, suffix: '+', icon: UserGroupIcon },
    { label: 'Expert Agents', end: 650, suffix: '+', icon: ShieldCheckIcon },
    { label: 'Cities Covered', end: 180, suffix: '+', icon: MapPinIcon },
  ];

  const heroFade = useFadeIn();
  const typesFade = useFadeIn();
  const stepsFade = useFadeIn();
  const statsFade = useFadeIn();
  const featuredFade = useFadeIn();
  const testimonialsFade = useFadeIn();
  const ctaFade = useFadeIn();

  /* ═══════════════════════ RENDER ═══════════════════════ */
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ─── NAVBAR ─── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
                  <HomeIcon className="w-5 h-5 text-white" />
                </div>
                <span className={`text-xl font-bold transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                  Estate<span className="text-indigo-500">Hub</span>
                </span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center space-x-1">
              {[
                { to: '/properties', label: 'Browse' },
                { to: '/properties?is_featured=1', label: 'Featured' },
              ].map((link) => (
              <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    scrolled
                      ? 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
              </Link>
              ))}

              {isAuthenticated ? (
                <div className="flex items-center space-x-2 ml-4">
                  {(user?.role === 'agent' || user?.role === 'admin') && (
                    <Link
                      to="/agent/dashboard"
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        scrolled
                          ? 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                          : 'text-white/90 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      Dashboard
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        scrolled
                          ? 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                          : 'text-white/90 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      scrolled
                        ? 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span>{user?.name?.split(' ')[0]}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      scrolled
                        ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 ml-4">
                  <Link
                    to="/login"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      scrolled
                        ? 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 rounded-lg transition-colors ${scrolled ? 'text-gray-700' : 'text-white'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t shadow-xl">
            <div className="px-4 py-4 space-y-2">
              <Link to="/properties" className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium">
                Browse Properties
              </Link>
              <Link to="/properties?is_featured=1" className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium">
                Featured
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium">
                    Profile
                  </Link>
                  {(user?.role === 'agent' || user?.role === 'admin') && (
                    <Link to="/agent/dashboard" className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium">
                      Dashboard
                    </Link>
                  )}
                  <button onClick={logout} className="block w-full text-left px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 font-medium">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium">
                    Sign In
                  </Link>
                  <Link to="/register" className="block px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center font-semibold">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950" />
          {/* Decorative blobs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div
          ref={heroFade.ref}
          className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-1000 ${
            heroFade.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 mb-8">
            <SparklesIcon className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-white/90 font-medium">#1 Real Estate Platform — Trusted by Thousands</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Discover Your
            <span className="block mt-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Perfect Home
            </span>
            </h1>

          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-white/70 leading-relaxed">
            Explore thousands of curated listings with advanced search, virtual tours, 
            and expert agents ready to help you every step of the way.
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="mt-10 max-w-3xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 shadow-2xl shadow-black/20">
              {/* Location Input */}
              <div className="flex-1 flex items-center px-4 py-3">
                <MapPinIcon className="w-5 h-5 text-indigo-400 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="City, neighborhood, or address..."
                  className="w-full bg-transparent text-white placeholder-white/50 outline-none text-base"
                />
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px bg-white/20 my-2" />

              {/* Property Type Select */}
              <div className="flex items-center px-4 py-3 sm:w-48">
                <HomeIcon className="w-5 h-5 text-indigo-400 mr-3 flex-shrink-0" />
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full bg-transparent text-white outline-none text-base appearance-none cursor-pointer [&>option]:text-gray-900"
                >
                  <option value="">All Types</option>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="condo">Condo</option>
                  <option value="villa">Villa</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="commercial">Commercial</option>
                </select>
                <ChevronDownIcon className="w-4 h-4 text-white/50 -ml-5 pointer-events-none" />
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="m-1 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center space-x-2"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
                <span>Search</span>
              </button>
            </div>
          </form>

          {/* Quick Links */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="text-white/50 text-sm">Popular:</span>
            {['New York', 'Los Angeles', 'Miami', 'San Francisco', 'Chicago'].map(
              (city) => (
                <Link
                  key={city}
                  to={`/properties?search=${city}`}
                  className="px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white/80 rounded-full text-sm transition-all hover:-translate-y-0.5"
                >
                  {city}
                </Link>
              )
            )}
          </div>

          {/* Scroll indicator */}
          <div className="mt-16 animate-bounce">
            <ChevronDownIcon className="w-6 h-6 text-white/40 mx-auto" />
          </div>
        </div>
      </section>

      {/* ─── PROPERTY TYPES ─── */}
      <section className="py-20 bg-gray-50">
        <div
          ref={typesFade.ref}
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
            typesFade.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-4">
              Explore
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Browse by Property Type
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Whether you're looking for a cozy apartment or a spacious villa, we have options for every lifestyle.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
            {propertyTypes.map((type) => (
              <Link
                key={type.value}
                to={`/properties?property_type=${type.value}`}
                className="group relative bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-14 h-14 ${type.bg} group-hover:bg-white/20 rounded-2xl mb-4 transition-colors`}>
                    <type.icon className={`w-7 h-7 ${type.text} group-hover:text-white transition-colors`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-white transition-colors">
                    {type.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED PROPERTIES ─── */}
      {featuredProperties.length > 0 && (
        <section className="py-20 bg-white">
          <div
            ref={featuredFade.ref}
            className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
              featuredFade.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-14">
              <div>
                <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-4">
                  ⭐ Featured
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Handpicked Properties
                </h2>
                <p className="mt-3 text-lg text-gray-500 max-w-xl">
                  Premium listings curated by our experts — the best of what's on the market right now.
                </p>
              </div>
              <Link
                to="/properties?is_featured=1"
                className="mt-6 sm:mt-0 inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-700 group"
              >
                View All
                <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.slice(0, 6).map((property) => {
                const primaryImage = property.images?.find((img) => img.is_primary) || property.images?.[0];
                const imageUrl = primaryImage
                  ? `${process.env.REACT_APP_API_URL?.replace('/api', '')}/storage/${primaryImage.image_path}`
                  : null;

                return (
                  <Link
                    key={property.id}
                    to={`/properties/${property.id}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-1"
                  >
                    {/* Image */}
                    <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <HomeIcon className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      {property.is_featured && (
                        <span className="absolute top-3 left-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          ⭐ Featured
                        </span>
                      )}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700 capitalize">
                        {property.status?.replace('_', ' ') || 'Available'}
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="text-2xl font-bold text-white drop-shadow-lg">
                          {property.formatted_price || `$${Number(property.price).toLocaleString()}`}
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {property.title}
                      </h3>
                      <div className="flex items-center text-gray-500 mt-2">
                        <MapPinIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
                        <span className="text-sm line-clamp-1">
                          {property.city}, {property.state}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                        {property.bedrooms != null && (
                          <span className="flex items-center">
                            <span className="font-bold text-gray-900 mr-1">{property.bedrooms}</span> Beds
                          </span>
                        )}
                        {property.bathrooms != null && (
                          <span className="flex items-center">
                            <span className="font-bold text-gray-900 mr-1">{property.bathrooms}</span> Baths
                          </span>
                        )}
                        {property.square_feet != null && (
                          <span className="flex items-center">
                            <span className="font-bold text-gray-900 mr-1">{Number(property.square_feet).toLocaleString()}</span> sqft
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── STATS ─── */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '30px 30px',
        }} />

        <div
          ref={statsFade.ref}
          className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
            statsFade.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Trusted by Thousands Nationwide
            </h2>
            <p className="mt-4 text-lg text-indigo-200 max-w-2xl mx-auto">
              Numbers that speak to our commitment to connecting people with their perfect homes.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <StatCard key={idx} stat={stat} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 bg-white">
        <div
          ref={stepsFade.ref}
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
            stepsFade.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">
              Simple Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Three simple steps to finding and securing your dream property.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, idx) => (
              <div key={idx} className="relative group">
                {/* Connector line */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-full h-0.5 bg-gradient-to-r from-indigo-200 to-transparent" />
                )}
                <div className="bg-gray-50 rounded-3xl p-8 text-center hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100">
                  <div className="relative inline-flex">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-indigo-600 text-white rounded-full text-sm font-bold flex items-center justify-center shadow-md">
                      {idx + 1}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-gray-900">{step.title}</h3>
                  <p className="mt-3 text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-20 bg-gray-50">
        <div
          ref={testimonialsFade.ref}
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
            testimonialsFade.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-rose-100 text-rose-700 rounded-full text-sm font-semibold mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              What Our Clients Say
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Real stories from real people who found their perfect property with us.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 relative group hover:-translate-y-1"
              >
                {/* Quote mark */}
                <div className="absolute top-6 right-6 text-6xl text-indigo-100 font-serif leading-none select-none">"</div>

                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <StarSolid key={i} className="w-5 h-5 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 relative z-10">"{t.quote}"</p>
                <div className="flex items-center pt-4 border-t border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {t.avatar}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900">{t.name}</h4>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="py-20 bg-white">
        <div
          ref={ctaFade.ref}
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
            ctaFade.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }} />
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 px-8 py-16 sm:px-16 sm:py-20 text-center">
              {isAuthenticated && (user?.role === 'agent' || user?.role === 'admin') ? (
                <>
                  <h2 className="text-3xl sm:text-4xl font-bold text-white">
                    Ready to List Your Properties?
                  </h2>
                  <p className="mt-4 text-lg text-indigo-200 max-w-2xl mx-auto">
                    Reach thousands of active buyers and renters. List your property in minutes with our easy-to-use tools.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      to="/properties/new"
                      className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl hover:-translate-y-0.5"
                    >
                      <HomeIcon className="w-5 h-5 mr-2" />
                      List a Property
                    </Link>
                    <Link
                      to="/agent/dashboard"
                      className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white border-2 border-white/30 rounded-xl font-bold text-lg hover:bg-white/20 transition-all hover:-translate-y-0.5"
                    >
                      Go to Dashboard
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-3xl sm:text-4xl font-bold text-white">
                    Ready to Find Your Dream Home?
                  </h2>
                  <p className="mt-4 text-lg text-indigo-200 max-w-2xl mx-auto">
                    Join thousands of happy homeowners who found their perfect property through our platform. 
                    Sign up today and start your journey.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      to={isAuthenticated ? '/properties' : '/register'}
                      className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl hover:-translate-y-0.5"
                    >
                      {isAuthenticated ? 'Browse Properties' : 'Get Started Free'}
                      <ArrowRightIcon className="w-5 h-5 ml-2" />
                    </Link>
                    <Link
                      to="/properties"
                      className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white border-2 border-white/30 rounded-xl font-bold text-lg hover:bg-white/20 transition-all hover:-translate-y-0.5"
                    >
                      <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                      Explore Listings
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4">
              Why Choose Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Everything You Need in One Place
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: MagnifyingGlassIcon, title: 'Smart Search', desc: 'AI-powered search with location autocomplete, filters, and saved searches.', color: 'from-blue-500 to-blue-600' },
              { icon: ShieldCheckIcon, title: 'Verified Agents', desc: 'Every agent on our platform is verified for your peace of mind.', color: 'from-emerald-500 to-emerald-600' },
              { icon: ChatBubbleLeftRightIcon, title: 'Instant Messaging', desc: 'Connect directly with agents and property owners in real-time.', color: 'from-purple-500 to-purple-600' },
              { icon: ChartBarIcon, title: 'Market Analytics', desc: 'Access price history, market trends, and neighborhood insights.', color: 'from-amber-500 to-amber-600' },
              { icon: HeartIcon, title: 'Save Favorites', desc: 'Bookmark properties you love and get notified about price changes.', color: 'from-rose-500 to-rose-600' },
              { icon: CurrencyDollarIcon, title: 'Transparent Pricing', desc: 'No hidden fees. See full price history and comparable sales data.', color: 'from-cyan-500 to-cyan-600' },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center space-x-2 mb-6">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <HomeIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">
                  Estate<span className="text-indigo-400">Hub</span>
                </span>
              </Link>
              <p className="text-slate-400 leading-relaxed mb-6">
                Your trusted partner in finding the perfect property. We connect buyers, sellers, and agents seamlessly.
              </p>
              <div className="flex items-center space-x-3">
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-indigo-600 rounded-xl flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-indigo-600 rounded-xl flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-indigo-600 rounded-xl flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-6">Quick Links</h3>
              <ul className="space-y-3">
                {[
                  { to: '/properties', label: 'Browse Properties' },
                  { to: '/properties?property_type=house', label: 'Houses' },
                  { to: '/properties?property_type=apartment', label: 'Apartments' },
                  { to: '/properties?property_type=condo', label: 'Condos' },
                  { to: '/properties?is_featured=1', label: 'Featured Listings' },
                ].map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-slate-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Agents */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-6">For Agents</h3>
              <ul className="space-y-3">
                {[
                  { to: '/register', label: 'Become an Agent' },
                  { to: '/subscription', label: 'Pricing Plans' },
                  { to: '/feature-listing', label: 'Feature a Listing' },
                  { to: '/agent/dashboard', label: 'Agent Dashboard' },
                  { to: '/agent/analytics', label: 'Analytics' },
                ].map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-slate-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-6">Contact Us</h3>
              <ul className="space-y-4">
                <li className="flex items-center text-slate-400">
                  <EnvelopeIcon className="w-5 h-5 mr-3 text-indigo-400" />
                  support@estatehub.com
                </li>
                <li className="flex items-center text-slate-400">
                  <PhoneIcon className="w-5 h-5 mr-3 text-indigo-400" />
                  +1 (555) 123-4567
                </li>
                <li className="flex items-center text-slate-400">
                  <MapPinIcon className="w-5 h-5 mr-3 text-indigo-400" />
                  123 Market Street, SF, CA
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} EstateHub. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
