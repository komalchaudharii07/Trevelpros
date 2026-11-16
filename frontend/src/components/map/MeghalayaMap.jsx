import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  LocateFixed,
  X,
  Navigation,
  ArrowRight,
  MapPin,
  Compass,
} from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import { fetchLocations } from "../../services/api";

// =====================================================
// LEAFLET DEFAULT MARKER ICON
// =====================================================

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// =====================================================
// MEGHALAYA CENTER
// =====================================================

const MEGHALAYA_CENTER = [25.467, 91.366];

// =====================================================
// MAP CONTROLLER
// =====================================================

const MapController = ({ focus }) => {
  const map = useMap();

  useEffect(() => {
    if (focus) {
      map.flyTo(focus.position, focus.zoom, {
        duration: 1.2,
      });
    }
  }, [focus, map]);

  return null;
};

// =====================================================
// MAIN COMPONENT
// =====================================================

const MeghalayaMap = () => {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState(null);

  const [dbLocations, setDbLocations] = useState([]);

  const [searchMarker, setSearchMarker] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  const [focus, setFocus] = useState(null);

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH DATABASE LOCATIONS
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    const getDbLocations = async () => {
      try {
        const data = await fetchLocations();

        const locations = Array.isArray(data)
          ? data
          : data?.locations || data?.data || [];

        if (!cancelled) {
          setDbLocations(locations);
        }
      } catch (err) {
        console.error("Failed to fetch locations:", err);

        if (!cancelled) {
          setError("Could not load tourist locations.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    getDbLocations();

    return () => {
      cancelled = true;
    };
  }, []);

  // =====================================================
  // SEARCH PLACE GLOBALLY USING PHOTON API
  // =====================================================

  const searchPlace = async () => {
    if (!query.trim()) return;

    try {
      setSearching(true);
      setError("");
      setSelectedPlace(null);
      setSearchMarker(null);

      const searchQuery = query.trim();

      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(
          searchQuery
        )}&limit=5`
      );

      if (!response.ok) {
        throw new Error("Location search failed.");
      }

      const data = await response.json();

      if (!data.features || data.features.length === 0) {
        setError(
          `"${searchQuery}" was not found. Try another place name.`
        );
        return;
      }

      const place = data.features[0];

      const [lng, lat] = place.geometry.coordinates;
      const properties = place.properties;

      const name = properties.name || searchQuery;

      const address = [
        properties.street,
        properties.city ||
        properties.town ||
        properties.village ||
        properties.district,
        properties.state,
        properties.country,
      ]
        .filter(
          (item, index, array) =>
            item && array.indexOf(item) === index
        )
        .join(", ");

      const position = [lat, lng];

      setSearchMarker({
        name,
        position,
      });

      setCurrentLocation(null);

      setFocus({
        position,
        zoom: 14,
      });

      setSelectedPlace({
        name,
        address: address || "Address not available",
        location: {
          lat,
          lng,
        },
        photo: null,
        isDatabaseTour: false,
        isCurrentLocation: false,
      });
    } catch (err) {
      console.error("Place search error:", err);
      setError(err.message || "Could not search this place.");
    } finally {
      setSearching(false);
    }
  };

  // =====================================================
  // OPEN DESTINATION DETAILS PAGE
  // =====================================================

  const openDestinationDetails = () => {
    if (!selectedPlace || selectedPlace.isCurrentLocation) {
      return;
    }

    navigate("/destination/search", {
      state: {
        destination: {
          id: selectedPlace.id || null,
          name: selectedPlace.name,
          address: selectedPlace.address,
          location: selectedPlace.location,
          plainimage: selectedPlace.photo, // Pass plainimage property for consistency
          isDatabaseTour: selectedPlace.isDatabaseTour,
          description: selectedPlace.description || "",
        },
      },
    });
  };

  // =====================================================
  // GET CURRENT LOCATION
  // =====================================================

  const locateMe = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const location = [lat, lng];

        setCurrentLocation(location);
        setSearchMarker(null);

        setFocus({
          position: location,
          zoom: 15,
        });

        setSelectedPlace({
          name: "Your Location",
          address: "Current browser location",
          location: {
            lat,
            lng,
          },
          photo: null,
          isDatabaseTour: false,
          isCurrentLocation: true,
        });
      },

      (geoError) => {
        console.error(geoError);

        setError(
          "Unable to access your location. Please allow location permission."
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  // =====================================================
  // RESET MAP
  // =====================================================

  const resetMap = () => {
    setQuery("");
    setSelectedPlace(null);
    setSearchMarker(null);
    setCurrentLocation(null);
    setError("");

    setFocus({
      position: MEGHALAYA_CENTER,
      zoom: 9,
    });
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="relative h-[650px] w-full overflow-hidden rounded-xl bg-gray-100">

      {/* MAP */}

      <MapContainer
        center={MEGHALAYA_CENTER}
        zoom={9}
        scrollWheelZoom={true}
        zoomControl={true}
        className="absolute inset-0 h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController focus={focus} />

        {/* DATABASE LOCATIONS */}

        {dbLocations.map((loc) => {
          const lat =
            loc.mapCoordinates?.lat ??
            loc.lat ??
            loc.latitude;

          const lng =
            loc.mapCoordinates?.lng ??
            loc.lng ??
            loc.longitude;

          const tourId = loc._id || loc.id;

          if (
            !Number.isFinite(Number(lat)) ||
            !Number.isFinite(Number(lng)) ||
            !tourId
          ) {
            return null;
          }

          const position = [
            Number(lat),
            Number(lng),
          ];

          // Resolve image from plainimage or image fields in database
          const resolvedImage = loc.plainimage || loc.image;

          return (
            <Marker
              key={tourId}
              position={position}
              eventHandlers={{
                click: () => {
                  setFocus({
                    position,
                    zoom: 14,
                  });

                  setSelectedPlace({
                    id: tourId,
                    name: loc.title || loc.name || "Meghalaya destination",
                    address:
                      loc.location ||
                      loc.address ||
                      "Meghalaya, India",

                    photo:
                      typeof resolvedImage === "string" &&
                      /^https?:\/\//i.test(resolvedImage)
                        ? resolvedImage
                        : null,

                    description: loc.mainDescription || loc.description || "",

                    location: {
                      lat: Number(lat),
                      lng: Number(lng),
                    },

                    isDatabaseTour: Array.isArray(loc.views) && loc.views.length > 0,
                    isCurrentLocation: false,
                  });

                  setSearchMarker(null);
                  setCurrentLocation(null);
                },
              }}
            >
              <Popup>
                <strong>
                  {loc.title || loc.name}
                </strong>
              </Popup>
            </Marker>
          );
        })}

        {/* SEARCH MARKER */}

        {searchMarker && (
          <Marker position={searchMarker.position}>
            <Popup>
              <strong>{searchMarker.name}</strong>
            </Popup>
          </Marker>
        )}

        {/* CURRENT LOCATION MARKER */}

        {currentLocation && (
          <Marker position={currentLocation}>
            <Popup>Your current location</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* LOADING */}

      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-[#f7f7f3]/90">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-gray-300 border-t-[#183c2c]" />

            <p className="mt-4 text-sm text-gray-500">
              Loading Meghalaya map...
            </p>
          </div>
        </div>
      )}

      {/* ERROR MESSAGE */}

      {error && (
        <div className="absolute left-1/2 top-5 z-[1000] w-[90%] max-w-md -translate-x-1/2 rounded-2xl border border-red-200 bg-white p-4 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-red-600">
                Map issue
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                {error}
              </p>
            </div>

            <button
              onClick={() => setError("")}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* SEARCH BAR */}

      <div className="absolute left-4 right-4 top-4 z-[500] sm:left-6 sm:right-auto sm:w-[400px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            searchPlace();
          }}
          className="flex items-center rounded-2xl border border-gray-200 bg-white px-4 shadow-xl"
        >
          <Search
            size={19}
            className="shrink-0 text-gray-400"
          />

          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError("");
            }}
            placeholder="Search any place in the world..."
            className="h-13 w-full bg-transparent px-3 text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setError("");
              }}
              className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100"
            >
              <X size={16} />
            </button>
          )}
        </form>

        <button
          onClick={searchPlace}
          disabled={!query.trim() || searching}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#183c2c] py-3 text-sm font-medium text-white shadow-lg transition hover:bg-[#214d39] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Search size={15} />

          {searching ? "Searching..." : "Search this place"}
        </button>
      </div>

      {/* MAP CONTROLS */}

      <div className="absolute right-4 top-4 z-[500] flex flex-col gap-2">
        <button
          onClick={locateMe}
          title="My location"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-lg hover:bg-gray-50"
        >
          <LocateFixed size={18} />
        </button>

        <button
          onClick={resetMap}
          title="Back to Meghalaya"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-lg hover:bg-gray-50"
        >
          <Navigation size={17} />
        </button>
      </div>

      {/* SELECTED PLACE CARD */}

      {selectedPlace && (
        <div className="absolute bottom-5 left-5 z-[500] w-[calc(100%-40px)] max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          {selectedPlace.photo && (
            <img
              src={selectedPlace.photo}
              alt={selectedPlace.name}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
              className="h-36 w-full object-cover"
            />
          )}

          <div className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100">
                    <MapPin
                      size={14}
                      className="text-emerald-700"
                    />
                  </span>

                  <p className="text-base font-semibold text-[#17221d]">
                    {selectedPlace.name}
                  </p>
                </div>

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  {selectedPlace.address}
                </p>
              </div>

              <button
                onClick={() => setSelectedPlace(null)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            {/* EXPLORE DETAILS */}

            {!selectedPlace.isCurrentLocation && (
              <button
                onClick={openDestinationDetails}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#183c2c] py-2.5 text-xs font-semibold text-white transition hover:bg-[#214d39]"
              >
                <Compass size={15} />
                Explore Details
                <ArrowRight size={14} />
              </button>
            )}

            {/* 360 DEGREE TOUR */}

            {selectedPlace.isDatabaseTour && (
              <button
                onClick={() =>
                  navigate(
                    `/virtual-tours/${selectedPlace.id}`
                  )
                }
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[#183c2c] py-2.5 text-xs font-semibold text-[#183c2c] transition hover:bg-[#f0f5f1]"
              >
                <span>View 360° Panorama Tour</span>
                <ArrowRight size={14} />
              </button>
            )}

            {/* COORDINATES */}

            {selectedPlace.location && (
              <div className="mt-3 rounded-xl bg-[#f7f7f3] px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-gray-400">
                  Coordinates
                </p>

                <p className="mt-1 text-xs text-gray-600">
                  {selectedPlace.location.lat.toFixed(5)}
                  {" , "}
                  {selectedPlace.location.lng.toFixed(5)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MAP LABEL */}

      <div className="absolute bottom-4 right-4 z-[400] hidden rounded-full border border-white/60 bg-white/90 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500 shadow-md backdrop-blur-sm sm:block">
        Meghalaya · OpenStreetMap
      </div>
    </div>
  );
};

export default MeghalayaMap;