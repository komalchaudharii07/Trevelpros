import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
  Camera,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getVerifiedImage } from "../utils/imageOverrides";
import { getCommonsImages } from "../utils/wikimedia";

const Gallery = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch real locations dynamically from your backend API
    fetch("http://localhost:5000/api/locations")
      .then((res) => res.json())
      .then(async (data) => {
        // Map database fields with 3-tier image resolution fallback and 360 tour status
        const formattedPlaces = await Promise.all(
          data.map(async (loc) => {
            // Priority 1: Check database plainimage
            let imageUrl = loc.plainimage;

            if (!imageUrl) {
              // Priority 2: Check your hand-verified manual override helper
              imageUrl = getVerifiedImage(loc.title);

              // Priority 3: Fallback to Commons API search
              if (!imageUrl) {
                const commonsResults = await getCommonsImages({
                  name: loc.title,
                  address: loc.location,
                  lat: loc.mapCoordinates?.lat || loc.lat,
                  lng: loc.mapCoordinates?.lng || loc.lng,
                });
                imageUrl = commonsResults?.[0]?.image;
              }
            }

            // Check if this location has 360° views configured in the schema
            const hasTour = Array.isArray(loc.views) && loc.views.length > 0;

            return {
              id: loc._id,
              name: loc.title,
              location: loc.location,
              plainimage: imageUrl || "https://images.unsplash.com/photo-1544735716-392fe2489ffa",
              description: loc.mainDescription,
              lat: loc.mapCoordinates?.lat || loc.lat || 25.5788,
              lng: loc.mapCoordinates?.lng || loc.lng || 91.8933,
              hasTour: hasTour, // <--- Flag for 360 tour availability
            };
          })
        );
        
        setPlaces(formattedPlaces);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch gallery locations:", err);
        setLoading(false);
      });
  }, []);

  const selectedPlace = selectedIndex !== null ? places[selectedIndex] : null;

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const showPrevious = () => {
    setSelectedIndex((current) =>
      current === 0 ? places.length - 1 : current - 1
    );
  };

  const showNext = () => {
    setSelectedIndex((current) =>
      current === places.length - 1 ? 0 : current + 1
    );
  };

  // Function to navigate and pass plainimage via state to /destination/search
  const handleNavigateToSearch = (place) => {
    navigate("/destination/search", {
      state: {
        destination: {
          id: place.id,
          name: place.name,
          address: place.location,
          description: place.description,
          plainimage: place.plainimage,
          isDatabaseTour: place.hasTour,
          location: {
            lat: place.lat,
            lng: place.lng,
          },
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f3] flex items-center justify-center text-gray-500 font-medium">
        Loading gallery from database...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f3] text-[#17221d]">

      {/* ================= NAVBAR ================= */}
      <header className="border-b border-gray-200 bg-[#f7f7f3]">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            Meghalaya<span className="text-emerald-600">.</span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <Link to="/" className="text-[13px] text-gray-500 hover:text-[#183c2c]">Home</Link>
            <Link to="/explore" className="text-[13px] text-gray-500 hover:text-[#183c2c]">Explore</Link>
            <Link to="/destinations" className="text-[13px] text-gray-500 hover:text-[#183c2c]">Destinations</Link>
            <Link to="/virtual-tours" className="text-[13px] text-gray-500 hover:text-[#183c2c]">360° Tours</Link>
            <Link to="/gallery" className="text-[13px] font-medium text-[#183c2c]">Gallery</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden rounded-full px-4 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-100 sm:block">Sign in</Link>
            <Link to="/signup" className="rounded-full bg-[#183c2c] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#214d39]">Get started</Link>
          </div>
        </div>
      </header>

      {/* ================= INTRO ================= */}
      <section className="px-6 pb-12 pt-16 lg:px-8 lg:pt-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-700">
              Visual journey
            </p>
            <h1 className="mt-3 text-[36px] font-semibold leading-[1.1] tracking-[-0.025em] md:text-[46px]">
              Meghalaya,
              <span className="text-emerald-700"> through our lens.</span>
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-6 text-gray-500">
              Waterfalls, living root bridges, misty hills and quiet villages — click any destination to view its full guide and Wikipedia insights.
            </p>
          </div>
        </div>
      </section>

      {/* ================= GALLERY GRID ================= */}
      <section className="px-6 pb-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <p className="text-[13px] text-gray-500">{places.length} places available</p>
            <Link to="/explore" className="hidden items-center gap-2 text-[13px] font-medium text-emerald-700 sm:flex">
              Explore on map
              <ArrowLeft size={14} className="rotate-180" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((place, index) => (
              <div
                key={place.id}
                onClick={() => handleNavigateToSearch(place)}
                className="group text-left cursor-pointer bg-white rounded-[20px] p-2 shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] bg-gray-200">
                  <img
                    src={place.plainimage}
                    alt={place.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />

                  {/* 360° Tour Badge Indicator */}
                  {place.hasTour && (
                    <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold text-emerald-400 backdrop-blur-md border border-emerald-500/30 shadow-md">
                      <Camera size={12} />
                      360° Tour
                    </span>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                  <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-300">
                      {place.location}
                    </p>
                    <p className="mt-1 text-[17px] font-semibold text-white">
                      {place.name}
                    </p>
                  </div>
                </div>

                <div className="px-2 pt-3 pb-2 flex items-center justify-between">
                  <div>
                    <h2 className="text-[15px] font-semibold text-[#17221d]">{place.name}</h2>
                    <p className="mt-1 text-[12px] text-gray-500">{place.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {place.hasTour && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/virtual-tours/${place.id}`);
                        }}
                        className="text-xs text-emerald-700 font-medium hover:bg-emerald-100 px-2.5 py-1 bg-emerald-50 rounded-lg transition"
                      >
                        360°
                      </button>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIndex(index);
                      }}
                      className="text-xs text-gray-700 font-medium hover:bg-gray-100 px-2.5 py-1 bg-gray-50 rounded-lg transition"
                    >
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= LIGHTBOX PREVIEW MODAL ================= */}
      {selectedPlace && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeLightbox}
              className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-black/70"
            >
              <X size={19} />
            </button>

            <div className="overflow-hidden rounded-[18px] bg-black relative">
              <img
                src={selectedPlace.plainimage}
                alt={selectedPlace.name}
                className="max-h-[78vh] w-full object-contain"
              />
              {selectedPlace.hasTour && (
                <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 backdrop-blur-md border border-emerald-500/30">
                  <Camera size={14} />
                  360° Tour Available
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-4 px-2">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-emerald-400">
                  {selectedPlace.location}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-white">
                  {selectedPlace.name}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                {selectedPlace.hasTour && (
                  <button
                    onClick={() => navigate(`/virtual-tours/${selectedPlace.id}`)}
                    className="rounded-full bg-[#10251a] border border-emerald-500/40 px-5 py-2.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-950 transition shadow-lg inline-flex items-center gap-1.5"
                  >
                    <Camera size={14} />
                    View 360° Tour
                  </button>
                )}
                <button
                  onClick={() => handleNavigateToSearch(selectedPlace)}
                  className="rounded-full bg-emerald-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition shadow-lg"
                >
                  View Full Guide & Wikipedia
                </button>
              </div>
            </div>

            <button
              onClick={showPrevious}
              className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-black/70 sm:-left-5"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={showNext}
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-black/70 sm:-right-5"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;