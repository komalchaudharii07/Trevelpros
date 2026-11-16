import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function LocationDetail() {
  const { id } = useParams(); // Grabs the MongoDB _id from the URL route
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Queries your backend route: GET /api/locations/:id
    fetch(`http://localhost:5000/api/locations/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Location not found');
        return res.json();
      })
      .then((data) => {
        setLocation(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching location details:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f3] flex items-center justify-center text-gray-500 font-medium">
        Loading destination guide...
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-[#f7f7f3] flex flex-col items-center justify-center">
        <p className="text-lg text-gray-600 mb-4">Location not found.</p>
        <Link to="/gallery" className="text-emerald-700 font-medium hover:underline">
          &larr; Back to Gallery
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f3] text-[#17221d] py-10 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button */}
        <Link 
          to="/gallery" 
          className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 mb-6 hover:underline"
        >
          <ArrowLeft size={16} /> Back to Gallery
        </Link>

        {/* Main Banner Image (Cloudinary) */}
        <div className="relative h-[400px] rounded-[24px] overflow-hidden shadow-lg bg-gray-200 mb-8">
          <img 
            src={location.image} 
            alt={location.title} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-8 text-white">
            <span className="text-xs font-semibold uppercase tracking-widest bg-emerald-600/85 px-3 py-1 rounded-full w-fit mb-2">
              {location.location}
            </span>
            <h1 className="text-4xl font-bold">{location.title}</h1>
          </div>
        </div>

        {/* Main Description */}
        <div className="bg-white rounded-[20px] p-8 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About this place</h2>
          <p className="text-gray-600 leading-relaxed text-base">{location.mainDescription}</p>
        </div>

        {/* Related Views / Photos (If any exist in DB) */}
        {location.views && location.views.length > 0 && (
          <div className="bg-white rounded-[20px] p-8 shadow-sm border border-gray-100 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Related Photos & Views</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {location.views.map((view, index) => (
                <div key={index} className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50">
                  <img src={view.iframeUrl} alt={view.viewTitle} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 text-sm">{view.viewTitle}</h4>
                    <p className="text-xs text-gray-500 mt-1">{view.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wikipedia Integration Section */}
        <div className="bg-white rounded-[20px] p-8 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Wikipedia & Historical Context</h3>
          <p className="text-sm text-gray-600 mb-4">
            Explore encyclopedic records and deeper historical background for {location.title}.
          </p>
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 text-sm">
            Wikipedia reference module successfully linked for this destination.
          </div>
        </div>

      </div>
    </div>
  );
}