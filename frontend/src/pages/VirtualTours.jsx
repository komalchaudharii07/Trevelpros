import {
  ArrowRight,
  Compass,
  Map,
  Move3D,
  X,
} from "lucide-react";

import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

import PanoramaViewer from "../components/panorama/PanoramaViewer";
import {
  fetchLocations,
  fetchLocationById,
} from "../services/api";

const VirtualTours = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tours, setTours] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTours = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetchLocations();

        console.log("COMPLETE API RESPONSE:", response);

        // Handle common API response structures
        const locations = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.locations)
              ? response.locations
              : Array.isArray(response?.data?.locations)
                ? response.data.locations
                : [];

        console.log("ALL LOCATIONS:", locations);
        console.log("FIRST LOCATION:", locations[0]);

        setTours(locations);

        if (id) {
          const matchedTour = locations.find(
            (tour) =>
              String(tour._id || tour.id) === String(id)
          );

          if (matchedTour) {
            setSelectedTour(matchedTour);
          } else {
            const singleResponse = await fetchLocationById(id);

            console.log("SINGLE LOCATION RESPONSE:", singleResponse);

            const singleTour =
              singleResponse?.data?.location ||
              singleResponse?.data ||
              singleResponse?.location ||
              singleResponse;

            if (singleTour && (singleTour._id || singleTour.id)) {
              setSelectedTour(singleTour);
            } else {
              setError("Requested tour was not found.");
            }
          }
        }
      } catch (err) {
        console.error("TOUR FETCH ERROR:", err);
        setError(
          err.response?.data?.message ||
          err.message ||
          "Unable to load virtual tours."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTours();
  }, [id]);

  const handleOpenTour = (tour) => {
    const tourId = tour._id || tour.id;

    if (!tourId) {
      setError("This location does not have a valid ID.");
      return;
    }

    setSelectedTour(tour);
    navigate(`/virtual-tours/${tourId}`);
  };

  const handleCloseTour = () => {
    setSelectedTour(null);
    navigate("/explore");
  };

  const getPreviewImage = (tour) => {
    return (
      tour.plainimage ||
      tour.image ||
      tour.photo ||
      tour.views?.[0]?.thumbnail ||
      tour.views?.[0]?.image ||
      ""
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f3]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-emerald-700" />
          <p className="text-gray-600">Loading virtual tours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f3] text-gray-900">
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800">
            <Compass size={17} />
            Explore Meghalaya
          </div>

          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Virtual Tours
          </h1>

          <p className="mt-4 max-w-2xl text-gray-600">
            Explore Meghalaya's beautiful destinations through
            immersive 360° experiences.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {tours.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
            <h2 className="text-xl font-semibold">
              No virtual tours available
            </h2>
            <p className="mt-2 text-gray-500">
              No locations were returned by the API.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                Discover Destinations
              </h2>

              <span className="text-sm text-gray-500">
                {tours.length} locations
              </span>
            </div>

            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {tours.map((tour) => {
                const previewImage = getPreviewImage(tour);

                return (
                  <button
                    key={tour._id || tour.id}
                    onClick={() => handleOpenTour(tour)}
                    className="group overflow-hidden rounded-2xl bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative h-64 overflow-hidden bg-gray-200">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt={tour.name || "Meghalaya destination"}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-500">
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                      <div className="absolute bottom-5 left-5 right-5 text-white">
                        <h3 className="text-2xl font-bold">
                          {tour.title || tour.name || tour.locationName || "Unnamed Location"}
                        </h3>

                        <p className="mt-1 text-sm text-white/80">
                          {tour.region || tour.address || "Meghalaya"}
                        </p>
                      </div>

                      <div className="absolute right-4 top-4 rounded-full bg-white/90 p-3 text-emerald-800">
                        <Move3D size={20} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-5">
                      <span className="text-sm text-gray-600">
                        Explore 360° experience
                      </span>

                      <ArrowRight
                        size={20}
                        className="text-emerald-800 transition group-hover:translate-x-1"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </section>

      {selectedTour && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black">
          <div className="flex items-center justify-between bg-[#101915] px-5 py-4 text-white">
            <div>
              <h2 className="text-lg font-semibold">
                {selectedTour.title || selectedTour.name || selectedTour.locationName || "Unnamed Location"}
              </h2>
              <p className="text-xs text-gray-400">
                360° Virtual Experience
              </p>
            </div>

            <button
              onClick={handleCloseTour}
              className="rounded-full bg-white/10 p-2 transition hover:bg-white/20"
              aria-label="Close virtual tour"
            >
              <X size={22} />
            </button>
          </div>

         {/* Inside VirtualTours.jsx modal section */}
<div className="h-[calc(100vh-73px)] w-full flex-1">
  <PanoramaViewer
    image={
      selectedTour.views?.[0]?.iframeUrl ||
      selectedTour.views?.[0]?.imageUrl ||
      selectedTour.views?.[0]?.image ||
      selectedTour.image ||
      ""
    }
  />
</div>
        </div>
      )}
    </div>
  );
};

export default VirtualTours;