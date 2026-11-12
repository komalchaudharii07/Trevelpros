
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";

const normalize = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

async function fetchCommons(params) {
  const url = new URL(COMMONS_API);

  Object.entries({
    ...params,
    format: "json",
    origin: "*",
  }).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Could not fetch Wikimedia images");
  }

  return response.json();
}

function getImageResults(data) {
  return Object.values(data?.query?.pages || {})
    .filter((page) => page.imageinfo?.[0]?.thumburl)
    .map((page) => ({
      image: page.imageinfo[0].thumburl,
      title: page.title.replace(/^File:/i, ""),
      source: page.imageinfo[0].descriptionurl,
    }))
    .filter((item) => {
      const title = item.title.toLowerCase();

      return (
        !/\.(svg|gif)$/i.test(title) &&
        !/logo|flag|map|icon|diagram|coat of arms|poster/i.test(title)
      );
    });
}

export async function getCommonsImages({
  name,
  address = "",
  lat,
  lng,
}) {
  if (!name) return [];

  const place = normalize(name);
  const locality = normalize(address);

  const aliases = {
    cherrapunji: ["sohra"],
    sohra: ["cherrapunji"],
  };

  const acceptedNames = [
    place,
    ...(aliases[place] || []),
  ];

  // Search exact place name first.
  try {
    const searchData = await fetchCommons({
      action: "query",
      generator: "search",
      gsrsearch: `filetype:bitmap "${name}" Meghalaya`,
      gsrnamespace: 6,
      gsrlimit: 30,
      prop: "imageinfo",
      iiprop: "url",
      iiurlwidth: 1600,
    });

    const searchImages = getImageResults(searchData);

    const matchedImages = searchImages.filter((item) => {
      const title = normalize(item.title);

      return (
        acceptedNames.some((word) => title.includes(word)) ||
        (locality &&
          title.includes(locality) &&
          title.includes("meghalaya"))
      );
    });

    if (matchedImages.length) return matchedImages;
  } catch (error) {
    console.error("Commons name search:", error);
  }

  // Fallback: photographs geotagged close to the selected place.
  if (
    Number.isFinite(Number(lat)) &&
    Number.isFinite(Number(lng))
  ) {
    try {
      const geoData = await fetchCommons({
        action: "query",
        generator: "geosearch",
        ggscoord: `${lat}|${lng}`,
        ggsradius: 3000,
        ggsnamespace: 6,
        ggslimit: 30,
        prop: "imageinfo",
        iiprop: "url",
        iiurlwidth: 1600,
      });

      // Only accept images whose filenames identify the place.
      const geoImages = getImageResults(geoData).filter((item) => {
        const title = normalize(item.title);

        return acceptedNames.some((word) => title.includes(word));
      });

      return geoImages;
    } catch (error) {
      console.error("Commons geosearch:", error);
    }
  }

  return [];
}

export async function getWikipediaDetails(name) {
  if (!name) return null;

  const aliases = {
    cherrapunji: "Sohra",
    sohra: "Cherrapunji",
  };

  const candidates = [
    name,
    aliases[normalize(name)],
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      const url = new URL("https://en.wikipedia.org/w/api.php");

      Object.entries({
        action: "query",
        prop: "extracts",
        exintro: "1",
        explaintext: "1",
        redirects: "1",
        titles: candidate,
        format: "json",
        origin: "*",
      }).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });

      const response = await fetch(url);

      if (!response.ok) continue;

      const data = await response.json();
      const page = Object.values(data?.query?.pages || {})[0];

      if (
        page &&
        !page.missing &&
        normalize(page.title) === normalize(candidate) &&
        page.extract
      ) {
        return {
          title: page.title,
          description: page.extract,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(
            page.title.replace(/ /g, "_")
          )}`,
        };
      }
    } catch (error) {
      console.error("Wikipedia lookup:", error);
    }
  }

  return null;
}
