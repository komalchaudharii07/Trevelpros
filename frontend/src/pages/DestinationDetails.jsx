import { useEffect, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Compass,
  MapPin,
  Play,
  Star,
  ExternalLink,
  Navigation,
  Camera,
  Coffee,
  House,
} from "lucide-react";

import {
  Link,
  useParams,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Navbar from "../components/navbar/Navbar";

import {
  getCommonsImages,
  getWikipediaDetails,
} from "../utils/wikimedia";

import { getVerifiedImage } from "../utils/imageOverrides"; // <--- 1. Import your override helper

// =====================================================
// STATIC DESTINATIONS
// =====================================================

const destinations = {
  shillong: {
    name: "Shillong",
    region: "East Khasi Hills",
    lat: 25.5788,
    lng: 91.8933,
    tagline: "The hill city of Meghalaya.",
    description:
      "Surrounded by pine-covered hills, Shillong is the cultural and urban heart of Meghalaya. Explore its viewpoints, local markets, cafés and beautiful landscapes.",
    experiences: [
      "Explore Shillong's beautiful viewpoints",
      "Walk through pine forests",
      "Discover local Khasi culture",
      "Experience Shillong's cafés and markets",
    ],
  },

  cherrapunji: {
    name: "Cherrapunji",
    region: "East Khasi Hills",
    lat: 25.2702,
    lng: 91.7323,
    tagline: "Where clouds meet the waterfalls.",
    description:
      "Cherrapunji, also known as Sohra, is famous for its spectacular waterfalls, deep valleys, natural caves and living root bridges.",
    experiences: [
      "Discover the spectacular Nohkalikai Falls",
      "Explore natural caves",
      "Walk through scenic mountain trails",
      "Visit the living root bridges",
    ],
  },

  dawki: {
    name: "Dawki",
    region: "West Jaintia Hills",
    lat: 25.1859,
    lng: 92.0241,
    tagline: "Where the river looks like glass.",
    description:
      "Dawki is famous for the remarkably clear waters of the Umngot River. Enjoy peaceful boat rides and beautiful riverside landscapes.",
    experiences: [
      "Experience the crystal-clear Umngot River",
      "Take a boat ride through the river",
      "Explore riverside landscapes",
      "Discover nearby villages and viewpoints",
    ],
  },

  nongriat: {
    name: "Nongriat",
    region: "East Khasi Hills",
    lat: 25.2405,
    lng: 91.6975,
    tagline: "A bridge grown by nature.",
    description:
      "Deep inside Meghalaya's tropical forests lies Nongriat, home to extraordinary living root bridges shaped by generations of Khasi communities.",
    experiences: [
      "Walk across the double-decker living root bridge",
      "Trek through dense forests",
      "Discover hidden waterfalls",
      "Experience remote Khasi villages",
    ],
  },
};

// =====================================================
// IMAGE COMPONENT
// =====================================================

const DestinationImage = ({
  images = [],
  alt,
  className = "",
}) => {
  const [imageIndex, setImageIndex] = useState(0);

  const currentImage = images[imageIndex];

  useEffect(() => {
    setImageIndex(0);
  }, [images[0]?.image]);

  if (!currentImage) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-[#142c24] via-[#1c4938] to-[#0b1712] ${className}`}
      >
        <div className="px-5 text-center text-white/70">
          <MapPin
            size={38}
            className="mx-auto text-emerald-400"
          />

          <p className="mt-3 text-sm font-medium">
            {alt}
          </p>

          <p className="mt-1 text-xs text-white/50">
            No matching photograph found
          </p>
        </div>
      </div>
    );
  }

  return (
    <img
      key={currentImage.image}
      src={currentImage.image}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => {
        setImageIndex((previous) => previous + 1);
      }}
      className={className}
      loading="eager"
    />
  );
};

// =====================================================
// SECTION HEADING
// =====================================================

const SectionHeading = ({
  label,
  title,
  description,
}) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
      {label}
    </p>

    <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
      {title}
    </h2>

    {description && (
      <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">
        {description}
      </p>
    )}
  </div>
);

// =====================================================
// MAIN COMPONENT
// =====================================================

const DestinationDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const destination = destinations[id?.toLowerCase()];

  const searchedDestination =
    location.state?.destination;

  const isSearchDestination = id === "search";

  const [dynamicImages, setDynamicImages] = useState([]);
  const [wikiDetails, setWikiDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // =====================================================
  // FETCH DYNAMIC IMAGES AND WIKIPEDIA DETAILS
  // =====================================================

  useEffect(() => {
    const activeDestination = isSearchDestination
      ? searchedDestination
      : destination;

    if (!activeDestination) {
      setDynamicImages([]);
      setWikiDetails(null);
      setLoadingDetails(false);
      return;
    }

    const lat = Number(
      isSearchDestination
        ? activeDestination.location?.lat
        : activeDestination.lat
    );

    const lng = Number(
      isSearchDestination
        ? activeDestination.location?.lng
        : activeDestination.lng
    );

    const name = activeDestination.name || "";

    const validCoordinates =
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      Math.abs(lat) <= 90 &&
      Math.abs(lng) <= 180;

    if (!validCoordinates || !name) {
      setDynamicImages([]);
      setWikiDetails(null);
      setLoadingDetails(false);
      return;
    }

    let cancelled = false;

    const loadDetails = async () => {
      setLoadingDetails(true);
      setDynamicImages([]);
      setWikiDetails(null);

      const address = isSearchDestination
        ? activeDestination.address || ""
        : `${activeDestination.region}, Meghalaya, India`;

      // 2. 3-Tier Image Resolution Strategy for Search/Static pages
      let resolvedImages = [];
      
      // Priority 1: Direct plainimage passed via router state or object
      const directImage = activeDestination.plainimage;
      if (directImage) {
        resolvedImages = [{ image: directImage, source: "Database / Direct URL" }];
      } else {
        // Priority 2: Check hand-verified overrides helper
        const verifiedUrl = getVerifiedImage(name);
        if (verifiedUrl) {
          resolvedImages = [{ image: verifiedUrl, source: "Verified Manual Override" }];
        }
      }

      // Priority 3: Fallback to Commons API if no direct/verified image exists
      if (resolvedImages.length === 0) {
        resolvedImages = await getCommonsImages({
          name,
          address,
          lat,
          lng,
        });
      }

      const wiki = isSearchDestination
        ? await getWikipediaDetails(name)
        : null;

      if (!cancelled) {
        setDynamicImages(resolvedImages);
        setWikiDetails(wiki);
        setLoadingDetails(false);
      }
    };

    loadDetails();

    return () => {
      cancelled = true;
    };
  }, [
    id,
    isSearchDestination,
    searchedDestination?.name,
    searchedDestination?.address,
    searchedDestination?.plainimage,
    searchedDestination?.location?.lat,
    searchedDestination?.location?.lng,
    destination?.name,
  ]);

  // =====================================================
  // DYNAMIC SEARCH DESTINATION
  // =====================================================

  if (isSearchDestination) {
    if (!searchedDestination) {
      return (
        <div className="min-h-screen bg-[#07110d] text-white">
          <Navbar />

          <div className="flex min-h-[75vh] flex-col items-center justify-center px-6 text-center">
            <MapPin
              size={38}
              className="text-emerald-400"
            />

            <h1 className="mt-5 text-3xl font-semibold">
              Destination not available
            </h1>

            <p className="mt-3 max-w-md text-sm leading-6 text-gray-400">
              Please search for a place again using the Explore map.
            </p>

            <Link
              to="/explore"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-[#07110d] transition hover:bg-emerald-400"
            >
              <ArrowLeft size={16} />
              Back to Explore
            </Link>
          </div>
        </div>
      );
    }

    const {
      name,
      address,
      plainimage,
      location: coordinates,
    } = searchedDestination;

    const lat = Number(coordinates?.lat);
    const lng = Number(coordinates?.lng);

    const validCoordinates =
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      Math.abs(lat) <= 90 &&
      Math.abs(lng) <= 180;

    const mapQuery = encodeURIComponent(
      `${name} ${address || ""}`
    );

    const mapUrl =
      `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

    const directionsUrl =
      `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`;

    const youtubeUrl =
      `https://www.youtube.com/results?search_query=${encodeURIComponent(
        `${name} travel guide`
      )}`;

    const attractionUrl =
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `Tourist attractions near ${name}`
      )}`;

    const homestayUrl =
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `Homestays near ${name}`
      )}`;

    const cafeUrl =
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `Cafes near ${name}`
      )}`;

    const mapPadding = 0.015;

    const mapEmbedUrl = validCoordinates
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng - mapPadding}%2C${lat - mapPadding}%2C${lng + mapPadding}%2C${lat + mapPadding}&layer=mapnik&marker=${lat}%2C${lng}`
      : null;

    return (
      <div className="min-h-screen overflow-hidden bg-[#07110d] text-white">
        <Navbar />

        {/* HERO */}

        <section className="relative min-h-[450px] overflow-hidden md:h-[550px]">
          <DestinationImage
            images={plainimage ? [{ image: plainimage }] : dynamicImages}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#07110d] via-black/40 to-black/20" />

          <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 md:px-10 md:pb-14">
            <div className="mx-auto max-w-7xl">
              <button
                onClick={() => navigate("/explore")}
                className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-xs text-white backdrop-blur-md transition hover:bg-white hover:text-black"
              >
                <ArrowLeft size={14} />
                Back to Explore
              </button>

              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">
                  Explore destination
                </p>
              </div>

              <h1 className="mt-4 text-5xl font-semibold leading-tight tracking-tight text-white md:text-7xl">
                {name}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
                {address ||
                  "Explore this destination and its surroundings."}
              </p>

              {dynamicImages[0]?.source && (
                <a
                  href={dynamicImages[0].source}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs text-white/60 hover:text-white"
                >
                  Photo source: Wikimedia Commons
                  <ExternalLink size={12} />
                </a>
              )}

              {loadingDetails && (
                <p className="mt-2 text-xs text-white/60">
                  Finding destination photographs...
                </p>
              )}

              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-[#07110d] transition hover:bg-emerald-300"
              >
                <Navigation size={16} />
                Get Directions
                <ArrowRight size={15} />
              </a>
            </div>
          </div>
        </section>

        {/* OVERVIEW */}

        <section className="px-6 py-14 md:px-10 md:py-16">
          <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-12">
            <div className="md:col-span-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
                Destination overview
              </p>

              <h2 className="mt-4 text-3xl font-semibold leading-tight text-white md:text-4xl">
                Discover
                <br />
                <span className="text-emerald-400">
                  {name}.
                </span>
              </h2>
            </div>

            <div className="md:col-span-7">
              <p className="text-sm leading-7 text-gray-400">
                {wikiDetails?.description ||
                  searchedDestination.description ||
                  `Explore ${name}, discover its surroundings and find interesting places to visit. Use the location map below to plan your journey.`}
              </p>

              {wikiDetails?.url && (
                <a
                  href={wikiDetails.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
                >
                  Read more on Wikipedia
                  <ExternalLink size={12} />
                </a>
              )}

              {loadingDetails && (
                <p className="mt-3 text-xs text-gray-500">
                  Loading verified location information...
                </p>
              )}

              {address && (
                <div className="mt-5 flex items-center gap-3 text-sm text-gray-400">
                  <MapPin
                    size={17}
                    className="shrink-0 text-emerald-400"
                  />
                  <span>{address}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* HOW TO REACH */}

        <section className="border-y border-white/10 bg-[#0c1913] px-6 py-12 md:px-10 md:py-14">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              label="Travel information"
              title={`How to reach ${name}`}
              description="Find directions and explore the location before starting your journey."
            />

            <div className="mt-7 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-[#111f18] p-5 transition hover:border-emerald-500/40">
                <Navigation
                  size={22}
                  className="text-emerald-400"
                />

                <h3 className="mt-4 text-base font-semibold text-white">
                  Directions
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Check available road routes and navigation directions.
                </p>

                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
                >
                  Get directions
                  <ArrowRight size={14} />
                </a>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#111f18] p-5 transition hover:border-emerald-500/40">
                <MapPin
                  size={22}
                  className="text-emerald-400"
                />

                <h3 className="mt-4 text-base font-semibold text-white">
                  Destination location
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  {address || "Location details are available on the map."}
                </p>

                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
                >
                  Open map
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ATTRACTIONS */}

        <section className="px-6 py-14 md:px-10 md:py-16">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              label="Discover nearby places"
              title="Important attractions"
              description={`Discover tourist attractions, viewpoints and interesting places around ${name}.`}
            />

            <a
              href={attractionUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-[#07110d] transition hover:bg-emerald-400"
            >
              <Compass size={16} />
              Discover attractions
              <ArrowRight size={14} />
            </a>
          </div>
        </section>

        {/* USEFUL LINKS */}

        <section className="border-y border-white/10 bg-[#0c1913] px-6 py-14 md:px-10 md:py-16">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              label="Explore more"
              title="Useful resources"
              description="Explore videos, maps and travel information for this destination."
            />

            <div className="mt-7 grid gap-4 md:grid-cols-3">
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-white/10 bg-[#111f18] p-5 transition hover:-translate-y-1 hover:border-emerald-500/40"
              >
                <Play
                  size={22}
                  className="text-emerald-400"
                />

                <h3 className="mt-4 text-base font-semibold text-white">
                  Travel videos
                </h3>

                <p className="mt-2 text-xs leading-5 text-gray-400">
                  Watch travel guides and destination videos.
                </p>

                <ExternalLink
                  size={15}
                  className="mt-4 text-emerald-400"
                />
              </a>

              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-white/10 bg-[#111f18] p-5 transition hover:-translate-y-1 hover:border-emerald-500/40"
              >
                <MapPin
                  size={22}
                  className="text-emerald-400"
                />

                <h3 className="mt-4 text-base font-semibold text-white">
                  Google Maps
                </h3>

                <p className="mt-2 text-xs leading-5 text-gray-400">
                  View the destination and surrounding areas.
                </p>

                <ExternalLink
                  size={15}
                  className="mt-4 text-emerald-400"
                />
              </a>

              <a
                href={attractionUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-white/10 bg-[#111f18] p-5 transition hover:-translate-y-1 hover:border-emerald-500/40"
              >
                <Compass
                  size={22}
                  className="text-emerald-400"
                />

                <h3 className="mt-4 text-base font-semibold text-white">
                  Nearby attractions
                </h3>

                <p className="mt-2 text-xs leading-5 text-gray-400">
                  Find interesting places to explore nearby.
                </p>

                <ExternalLink
                  size={15}
                  className="mt-4 text-emerald-400"
                />
              </a>
            </div>
          </div>
        </section>

        {/* HOMESTAYS */}

        <section className="px-6 py-14 md:px-10 md:py-16">
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 md:items-center">
            <div>
              <House
                size={24}
                className="text-emerald-400"
              />

              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
                Stay nearby
              </p>

              <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">
                Nearby homestays
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-400">
                Explore nearby homestays and accommodation options. Check
                current reviews, prices and availability before booking.
              </p>

              <a
                href={homestayUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Find homestays
                <ArrowRight size={15} />
              </a>
            </div>

            <div className="flex min-h-[150px] items-center justify-center rounded-xl border border-white/10 bg-[#0c1913]">
              <div className="text-center">
                <House
                  size={30}
                  className="mx-auto text-emerald-400"
                />

                <p className="mt-3 text-sm font-medium text-white">
                  Accommodation near {name}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Explore available stays
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CAFES */}

        <section className="border-y border-white/10 bg-[#0c1913] px-6 py-14 md:px-10 md:py-16">
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 md:items-center">
            <div className="flex min-h-[150px] items-center justify-center rounded-xl border border-white/10 bg-[#111f18] md:order-1">
              <div className="text-center">
                <Coffee
                  size={30}
                  className="mx-auto text-emerald-400"
                />

                <p className="mt-3 text-sm font-medium text-white">
                  Food and cafés near {name}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Explore local food spots
                </p>
              </div>
            </div>

            <div>
              <Coffee
                size={24}
                className="text-emerald-400"
              />

              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
                Local experiences
              </p>

              <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">
                Cafés near {name}
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-400">
                Explore nearby cafés, restaurants and local food spots.
                Check opening hours and reviews before visiting.
              </p>

              <a
                href={cafeUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Discover cafés
                <ArrowRight size={15} />
              </a>
            </div>
          </div>
        </section>

        {/* MAP */}

        <section className="px-6 py-14 md:px-10 md:py-16">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              label="Location on map"
              title="Find your way"
              description={`Explore the exact location of ${name} and its surrounding area.`}
            />

            <div className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-[#0c1913]">
              {mapEmbedUrl ? (
                <iframe
                  title={`${name} location map`}
                  src={mapEmbedUrl}
                  className="h-[300px] w-full border-0 md:h-[380px]"
                  loading="lazy"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-[220px] items-center justify-center">
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-emerald-400"
                  >
                    Open location on map
                  </a>
                </div>
              )}
            </div>

            <a
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Open full map
              <ExternalLink size={14} />
            </a>
          </div>
        </section>

        {/* 360 TOUR */}

        {searchedDestination.isDatabaseTour &&
          searchedDestination.id && (
            <section className="px-6 py-12 md:px-10">
              <div className="mx-auto max-w-7xl rounded-xl border border-emerald-500/20 bg-[#10251a] p-6 md:p-8">
                <Camera
                  size={25}
                  className="text-emerald-400"
                />

                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
                  Immersive experience
                </p>

                <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">
                  Experience {name} in 360°
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  A panorama tour is available for this destination.
                </p>

                <button
                  onClick={() =>
                    navigate(
                      `/virtual-tours/${searchedDestination.id}`
                    )
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-[#07110d] transition hover:bg-emerald-400"
                >
                  <Play size={14} fill="currentColor" />
                  Enter 360° experience
                  <ArrowRight size={14} />
                </button>
              </div>
            </section>
          )}

        {/* FOOTER */}

        <section className="border-t border-white/10 bg-[#0c1913] px-6 py-8 md:px-10">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <button
              onClick={() => navigate("/explore")}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition hover:text-emerald-400"
            >
              <ArrowLeft size={16} />
              Back to Explore
            </button>

            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-600">
              Discover the world
            </span>
          </div>
        </section>
      </div>
    );
  }

  // =====================================================
  // INVALID STATIC DESTINATION
  // =====================================================

  if (!destination) {
    return (
      <div className="min-h-screen bg-[#07110d] text-white">
        <Navbar />

        <div className="flex min-h-[75vh] items-center justify-center px-6">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">
              Meghalaya
            </p>

            <h1 className="mt-4 text-4xl font-semibold md:text-5xl">
              Destination not found.
            </h1>

            <Link
              to="/destinations"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-[#07110d] transition hover:bg-emerald-400"
            >
              <ArrowLeft size={17} />
              Back to destinations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // STATIC DESTINATION PAGE
  // =====================================================

  return (
    <div className="min-h-screen overflow-hidden bg-[#07110d] text-white">
      <Navbar />

      {/* HERO */}

      <section className="relative h-[65vh] min-h-[460px] overflow-hidden">
        <DestinationImage
          images={destination.plainimage ? [{ image: destination.plainimage }] : dynamicImages}
          alt={destination.name}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#07110d] via-black/25 to-black/10" />

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 md:px-10 md:pb-14">
          <div className="mx-auto max-w-7xl">
            <Link
              to="/destinations"
              className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/25 px-4 py-2 text-xs text-white backdrop-blur-md transition hover:bg-white hover:text-black"
            >
              <ArrowLeft size={14} />
              All destinations
            </Link>

            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

              <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
                {destination.region}
              </p>
            </div>

            <h1 className="mt-4 text-5xl font-semibold leading-tight tracking-tight text-white md:text-7xl">
              {destination.name}
            </h1>

            <p className="mt-3 max-w-xl text-sm text-white/75 md:text-base">
              {destination.tagline}
            </p>

            {dynamicImages[0]?.source && (
              <a
                href={dynamicImages[0].source}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-white/60 transition hover:text-white"
              >
                Photo source: Wikimedia Commons
                <ExternalLink size={11} />
              </a>
            )}

            {loadingDetails && (
              <p className="mt-2 text-xs text-white/60">
                Loading destination photographs...
              </p>
            )}
          </div>
        </div>
      </section>

      {/* INTRO */}

      <section className="px-6 py-14 md:px-10 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
              About the destination
            </p>

            <h2 className="text-3xl font-semibold leading-tight text-white md:text-5xl">
              Experience {destination.name}.
            </h2>
            <p className="mt-4 text-sm leading-7 text-gray-300">
              {destination.description}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DestinationDetails;