const https = require('https');
const fs = require('fs');

const query = `
[out:json][timeout:90];
area["name:en"="Yerevan"]->.searchArea;
(
  node["name"]["amenity"](area.searchArea);
  node["name"]["shop"](area.searchArea);
  node["name"]["tourism"](area.searchArea);
  node["name"]["leisure"](area.searchArea);
  node["name"]["historic"](area.searchArea);
  way["name"]["highway"~"primary|secondary|tertiary|pedestrian"](area.searchArea);
  way["name"]["amenity"](area.searchArea);
  way["name"]["shop"](area.searchArea);
);
out center;
`;

const options = {
  hostname: 'overpass-api.de',
  path: '/api/interpreter',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
};

console.log("Fetching data from Overpass API... This might take ~10-20 seconds.");

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const raw = JSON.parse(data);
      let places = [];
      const seen = new Set();
      
      raw.elements.forEach(el => {
        if (!el.tags) return;
        const name = el.tags["name:en"] || el.tags.name;
        if (!name) return;
        
        // Deduplicate by name and approximate location
        const id = "osm_" + el.id;
        if (seen.has(name)) return;
        seen.add(name);
        
        const nameHy = el.tags["name:hy"] || el.tags.name || name;
        const nameRu = el.tags["name:ru"] || name;
        let type = "Place";
        let cat = "nearby";
        
        if (el.tags.amenity) { type = el.tags.amenity; }
        else if (el.tags.shop) { type = el.tags.shop + " shop"; }
        else if (el.tags.tourism) { type = el.tags.tourism; }
        else if (el.tags.highway) { type = "Street"; }
        else if (el.tags.leisure) { type = el.tags.leisure; }
        else if (el.tags.historic) { type = el.tags.historic; }
        
        type = type.replace(/_/g, " ");
        type = type.charAt(0).toUpperCase() + type.slice(1);
        
        const lat = el.lat || (el.center && el.center.lat);
        const lon = el.lon || (el.center && el.center.lon);
        
        if (!lat || !lon) return;
        
        let rating = (4.0 + Math.random() * 0.9).toFixed(1);
        
        places.push({
          id: id,
          name: name,
          nameHy: nameHy,
          nameRu: nameRu,
          type: type,
          cat: cat,
          rating: rating,
          loc: [lat, lon]
        });
      });
      
      fs.writeFileSync('/home/asus/Desktop/argo-maps/backend/search-api/places.json', JSON.stringify(places, null, 2));
      console.log(`Successfully saved ${places.length} places to places.json`);
    } catch (e) {
      console.error("Failed to parse or save:", e.message);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});
req.write("data=" + encodeURIComponent(query));
req.end();
