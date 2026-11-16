// Hand-verified exact image URLs for your destinations
export const locationImageOverrides = {
  // Use lowercase keys so matching is foolproof
  "nohkalikai falls": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Nohkalikai_Falls_Cherrapunji.jpg/1600px-Nohkalikai_Falls_Cherrapunji.jpg",
  "shillong peak": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Shillong_View_From_Shillong_Peak.jpg/1600px-Shillong_View_From_Shillong_Peak.jpg",
  "double decker living root bridge": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Umshiang_Double_Decker_Root_Bridge.jpg/1600px-Umshiang_Double_Decker_Root_Bridge.jpg",
  "mawlynnong village": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Mawlynnong_cleanest_village_in_Asia.jpg/1600px-Mawlynnong_cleanest_village_in_Asia.jpg",
};

export const getVerifiedImage = (title) => {
  if (!title) return null;
  const normalizedKey = title.toLowerCase().trim();
  return locationImageOverrides[normalizedKey] || null;
};