import { ArrowUpRight, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLocations } from "../../services/api";

const DestinationSection = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadFeaturedLocations = async () => {
      try {
        const response = await fetchLocations();
        const locations = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.locations)
              ? response.locations
              : [];
        setDestinations(locations);
      } catch (err) {
        console.error("Failed to fetch featured destinations:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedLocations();
  }, []);

  const handleCardClick = (tourId) => {
    navigate(`/virtual-tours/${tourId}`);
  };

  // Only take the first 4 destinations for the home page
  const displayedDestinations = destinations.slice(0, 4);

  return (
    <section className="bg-[#06130f] px-6 py-28 md:px-10 md:py-32">
      <div className="mx-auto max-w-7xl">

        {/* TOP LABEL */}
        <div className="mb-8 flex items-center gap-3">
          <span className="h-px w-8 bg-emerald-300" />
          <span className="text-[10px] uppercase tracking-[0.35em] text-emerald-300">
            Featured destinations
          </span>
        </div>

        {/* HEADER */}
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <h2 className="max-w-3xl font-serif text-[42px] leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
              Handpicked places,
              <br />
              <span className="italic text-emerald-200">
                unforgettable experiences.
              </span>
            </h2>
          </div>

          <div className="flex items-end justify-between gap-8 lg:pb-1">
            <p className="max-w-md text-sm leading-7 text-white/45">
              From misty hills to crystal-clear rivers, discover
              the landscapes and places that make Meghalaya
              unforgettable through live 360° virtual tours.
            </p>

            {/* In your DestinationSection.jsx header button */}
<button
  onClick={() => navigate("/destinations")}
  className="group hidden shrink-0 items-center gap-3 text-xs text-white md:flex"
>
  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition duration-300 group-hover:border-emerald-300 group-hover:bg-emerald-300 group-hover:text-black">
    <ArrowUpRight size={15} />
  </span>
  <span className="whitespace-nowrap">Explore All</span>
</button>
          </div>
        </div>

        {/* BIG GAP */}
        <div className="h-14 md:h-16" />

        {/* DESTINATION CARDS GRID (Max 4) */}
        {loading ? (
          <div className="py-20 text-center text-white/50">Loading destinations...</div>
        ) : displayedDestinations.length === 0 ? (
          <div className="py-20 text-center text-white/50">No destinations found.</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            {displayedDestinations.map((destination) => {
              const tourId = destination._id || destination.id;
              const imageUrl = destination.plainimage || destination.image || "";

              return (
                <article
                  key={tourId}
                  onClick={() => handleCardClick(tourId)}
                  className="group relative aspect-[0.9] cursor-pointer overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#0a1b15]"
                >
                  <img
                    src={imageUrl}
                    alt={destination.title || destination.name}
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />

                  <div className="absolute left-3 top-3 md:left-4 md:top-4">
                    <span className="rounded-full border border-white/20 bg-black/25 px-2.5 py-1 text-[8px] text-white/80 backdrop-blur-md md:text-[9px]">
                      {destination.category || "Destination"}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <h3 className="font-serif text-xl leading-none text-white md:text-2xl">
                          {destination.title || destination.name}
                        </h3>

                        <div className="mt-2 flex items-center gap-1.5 text-[9px] text-white/50">
                          <MapPin size={10} className="text-emerald-300" />
                          <span>{destination.region || destination.location || "Meghalaya"}</span>
                        </div>
                      </div>

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/25 bg-black/20 text-white backdrop-blur-md transition duration-300 group-hover:border-emerald-300 group-hover:bg-emerald-300 group-hover:text-black">
                        <ArrowUpRight size={14} />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};

export default DestinationSection;