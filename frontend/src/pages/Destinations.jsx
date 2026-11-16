import { useState, useEffect } from "react";
import {
  ArrowRight,
  Map,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { fetchLocations } from "../services/api";

const Destinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Search, Category & Sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    const loadDestinations = async () => {
      try {
        setLoading(true);
        const response = await fetchLocations();
        const locations = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.locations)
              ? response.locations
              : Array.isArray(response?.data?.locations)
                ? response.data.locations
                : [];
        setDestinations(locations);
      } catch (err) {
        console.error("Failed to fetch destinations:", err);
        setError("Unable to load destinations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadDestinations();
  }, []);

  // Extract unique categories dynamically
  const categories = [
    "All",
    ...new Set(destinations.map((d) => d.category || "Explore")),
  ];

  // Filter and sort logic
  const filteredDestinations = destinations
    .filter((item) => {
      const title = item.title || item.name || "";
      const region = item.region || item.location || "";
      const category = item.category || "Explore";

      const matchesSearch =
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || category === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const nameA = (a.title || a.name || "").toLowerCase();
      const nameB = (b.title || b.name || "").toLowerCase();
      if (sortBy === "name") return nameA.localeCompare(nameB);
      if (sortBy === "name-desc") return nameB.localeCompare(nameA);
      return 0;
    });

  const featuredHero = destinations[0];

  return (
    <div className="min-h-screen bg-[#f7f7f3] text-[#17221d]">
      {/* ================= NAVBAR ================= */}
      <header className="border-b border-gray-200 bg-[#f7f7f3]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link to="/" className="text-xl font-semibold tracking-tight">
            Meghalaya<span className="text-emerald-600">.</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link to="/" className="text-sm text-gray-500 transition hover:text-[#183c2c]">
              Home
            </Link>
            <Link to="/explore" className="text-sm text-gray-500 transition hover:text-[#183c2c]">
              Explore
            </Link>
            <Link to="/destinations" className="text-sm font-medium text-[#183c2c]">
              Destinations
            </Link>
            <Link to="/virtual-tours" className="text-sm text-gray-500 transition hover:text-[#183c2c]">
              360° Tours
            </Link>
            <Link to="/gallery" className="text-sm text-gray-500 transition hover:text-[#183c2c]">
              Gallery
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden rounded-full px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-[#183c2c] sm:block">
              Sign in
            </Link>
            <Link to="/signup" className="rounded-full bg-[#183c2c] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#214d39]">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ================= PAGE INTRO ================= */}
      <section className="px-6 pb-12 pt-20 lg:px-8 lg:pb-16 lg:pt-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-700">
              Explore Meghalaya
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              Places worth
              <span className="text-emerald-700"> getting lost in.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-[16px] leading-7 text-gray-500">
              From lively hill towns to quiet villages, clear rivers and hidden
              waterfalls, discover the places that make Meghalaya unforgettable.
            </p>
          </div>
        </div>
      </section>

      {/* ================= FEATURED DESTINATION ================= */}
      {featuredHero && (
        <section className="px-6 pb-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div
              onClick={() => {
                const heroId = featuredHero._id || featuredHero.id;
                navigate(`/destinations/${heroId}`);
              }}
              className="group relative block h-[420px] cursor-pointer overflow-hidden rounded-[28px] sm:h-[480px] lg:h-[540px]"
            >
              <img
                src={featuredHero.plainimage || featuredHero.image || ""}
                alt={featuredHero.title || featuredHero.name}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-7 sm:p-10 lg:p-12">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-300">
                  Featured destination
                </p>

                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  {featuredHero.title || featuredHero.name}
                </h2>

                <p className="mt-3 max-w-xl text-[15px] leading-6 text-white/80">
                  {featuredHero.mainDescription ||
                    featuredHero.description ||
                    "Explore dramatic cliffs, misty valleys, and unforgettable landscapes across Meghalaya."}
                </p>

                <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[#183c2c] transition group-hover:bg-emerald-50">
                  Explore destination
                  <ArrowRight size={16} />
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================= DESTINATION GRID WITH SEARCH & SORT ================= */}
      <section className="bg-white px-6 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-700">
                All locations
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Explore the highlights.
              </h2>
            </div>

            <Link
              to="/explore"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
            >
              View on map
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Search & Sort Controls */}
          <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative max-w-md flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by place, region, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-gray-200 bg-[#f7f7f3] py-3 pl-11 pr-4 text-sm text-[#17221d] placeholder-gray-400 focus:border-emerald-700 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <SlidersHorizontal size={17} className="text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-full border border-gray-200 bg-[#f7f7f3] px-4 py-2.5 text-sm text-[#17221d] focus:border-emerald-700 focus:bg-white focus:outline-none"
              >
                <option value="name">Sort by Name (A–Z)</option>
                <option value="name-desc">Sort by Name (Z–A)</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                  selectedCategory === cat
                    ? "bg-[#183c2c] text-white"
                    : "border border-gray-200 bg-[#f7f7f3] text-gray-600 hover:border-emerald-700 hover:text-[#183c2c]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Cards */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-700" />
              <p className="text-sm text-gray-500">Loading destinations...</p>
            </div>
          ) : filteredDestinations.length === 0 ? (
            <div className="mt-12 rounded-2xl border border-gray-200 bg-[#f7f7f3] p-14 text-center">
              <h3 className="text-lg font-semibold">No matching locations</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try clearing your search or choosing another category.
              </p>
            </div>
          ) : (
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {filteredDestinations.map((destination) => {
                const destId = destination._id || destination.id;
                const imageUrl =
                  destination.plainimage || destination.image || "";

                return (
                  <div
                    key={destId}
                    onClick={() => navigate(`/destinations/${destId}`)}
                    className="group cursor-pointer overflow-hidden rounded-[22px] border border-gray-100 bg-[#f7f7f3] transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5"
                  >
                    {/* Image */}
                    <div className="relative h-[300px] overflow-hidden bg-gray-200">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={destination.title || destination.name}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />

                      {destination.category && (
                        <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#183c2c] backdrop-blur-md">
                          {destination.category}
                        </span>
                      )}

                      <div className="absolute bottom-5 left-5 flex items-center gap-1.5 text-xs font-medium text-white">
                        <MapPin size={14} />
                        {destination.region ||
                          destination.location ||
                          "Meghalaya"}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-5">
                        <div>
                          <h3 className="text-2xl font-semibold tracking-tight text-[#17221d]">
                            {destination.title || destination.name}
                          </h3>

                          <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-500">
                            {destination.mainDescription ||
                              destination.description ||
                              "Discover the natural beauty and serene landscapes of this iconic destination."}
                          </p>
                        </div>

                        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-[#183c2c] transition group-hover:border-emerald-200 group-hover:bg-emerald-50">
                          <ArrowRight size={16} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ================= MAP CTA ================= */}
      <section className="px-6 py-24 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[28px] bg-[#183c2c] px-7 py-14 text-center text-white sm:px-12 lg:px-16 lg:py-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-300">
              Plan your journey
            </p>
            <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
              There is more to Meghalaya than the famous places.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-white/60">
              Open the interactive map and discover viewpoints, waterfalls,
              villages, restaurants and places waiting to be explored.
            </p>
            <Link
              to="/explore"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#183c2c] transition hover:bg-emerald-50"
            >
              Explore interactive map
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-gray-200 bg-[#f7f7f3]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            Meghalaya<span className="text-emerald-600">.</span>
          </Link>

          <div className="flex flex-wrap gap-6 text-sm text-gray-500">
            <Link to="/" className="transition hover:text-[#183c2c]">
              Home
            </Link>
            <Link to="/explore" className="transition hover:text-[#183c2c]">
              Explore
            </Link>
            <Link to="/virtual-tours" className="transition hover:text-[#183c2c]">
              360° Tours
            </Link>
            <Link to="/gallery" className="transition hover:text-[#183c2c]">
              Gallery
            </Link>
            <Link to="/login" className="transition hover:text-[#183c2c]">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Destinations;