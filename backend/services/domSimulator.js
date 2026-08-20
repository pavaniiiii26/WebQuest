/**
 * DOM Simulator for Hackathon Self-Healing Demo
 *
 * Generates valid HTML documents for 20 real hotel listings across 3 DOM architecture versions.
 * Allows deterministic simulation of website refactorings / layout changes.
 */

const DEMO_HOTELS = [
  { name: 'The Leela Palace Goa', price: '$280/night', rating: '4.8 ★', location: 'Cavelossim, South Goa', img: 'https://images.unsplash.com/photo-1582610116397-edb72f96f8ab?w=500' },
  { name: 'W Goa Luxury Retreat', price: '$220/night', rating: '4.7 ★', location: 'Vagator Beach, North Goa', img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500' },
  { name: 'Taj Fort Aguada Heritage', price: '$195/night', rating: '4.6 ★', location: 'Sinquerim Beach, North Goa', img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500' },
  { name: 'Alila Diwa Eco Resort', price: '$165/night', rating: '4.5 ★', location: 'Majorda, South Goa', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500' },
  { name: 'The Zuri White Sands Beach Resort', price: '$120/night', rating: '4.3 ★', location: 'Varca, South Goa', img: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=500' },
  { name: 'Novotel Candolim Oceanfront', price: '$95/night', rating: '4.2 ★', location: 'Candolim, North Goa', img: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500' },
  { name: 'Grand Hyatt Bambolim Bay', price: '$240/night', rating: '4.7 ★', location: 'Bambolim, North Goa', img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500' },
  { name: 'ITC Grand Goa Beach Villas', price: '$290/night', rating: '4.9 ★', location: 'Arossim Beach, South Goa', img: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=500' },
  { name: 'Radisson Blu Cavelossim Coast', price: '$110/night', rating: '4.1 ★', location: 'Cavelossim, South Goa', img: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=500' },
  { name: 'Caravela Beach Resort', price: '$135/night', rating: '4.4 ★', location: 'Varca Beach, South Goa', img: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=500' },
  { name: 'Fairfield by Marriott Baga', price: '$85/night', rating: '4.0 ★', location: 'Baga, North Goa', img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500' },
  { name: 'Hard Rock Hotel Calangute', price: '$140/night', rating: '4.4 ★', location: 'Calangute, North Goa', img: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=500' },
  { name: 'Heritage Village Resort & Spa', price: '$105/night', rating: '4.2 ★', location: 'Arossim, South Goa', img: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=500' },
  { name: 'Vivanta Goa Panaji Riverside', price: '$130/night', rating: '4.5 ★', location: 'Panaji, Central Goa', img: 'https://images.unsplash.com/photo-1529290130-4ca3753253ae?w=500' },
  { name: 'Kenilworth Resort & Spa', price: '$125/night', rating: '4.3 ★', location: 'Utorda, South Goa', img: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=500' },
  { name: 'Planet Hollywood Beach Resort', price: '$150/night', rating: '4.4 ★', location: 'Utorda Beach, South Goa', img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=500' },
  { name: 'Resort Rio Arpora Suites', price: '$90/night', rating: '4.1 ★', location: 'Arpora, North Goa', img: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=500' },
  { name: 'Santana Beach Resort Boutique', price: '$70/night', rating: '4.2 ★', location: 'Candolim, North Goa', img: 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=500' },
  { name: 'Whispering Palms Beach Sanctuary', price: '$88/night', rating: '4.1 ★', location: 'Candolim, North Goa', img: 'https://images.unsplash.com/photo-1549294413-26f195200c16?w=500' },
  { name: 'The St. Regis Goa Oceanfront', price: '$350/night', rating: '4.9 ★', location: 'Mobor Beach, South Goa', img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500' },
];

export function getSimulatedDOM(version = 'v1_classic') {
  if (version === 'v2_modern_classes') {
    return generateV2DOM(DEMO_HOTELS);
  }
  if (version === 'v3_data_attributes') {
    return generateV3DOM(DEMO_HOTELS);
  }
  return generateV1DOM(DEMO_HOTELS);
}

function generateV1DOM(hotels) {
  const cardsHtml = hotels.map((h, i) => `
    <article class="hotel-card" id="hotel-item-${i}">
      <div class="media-container">
        <img class="hotel-img" src="${h.img}" alt="${h.name}" loading="lazy" />
      </div>
      <div class="content-body">
        <h3 class="hotel-name">${h.name}</h3>
        <div class="meta-row">
          <span class="location">${h.location}</span>
          <span class="rating">${h.rating}</span>
        </div>
        <div class="price-box">
          <span class="price">${h.price}</span>
        </div>
      </div>
    </article>
  `).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Luxury Hotel Listings (V1 Classic)</title>
</head>
<body>
  <header class="header-nav">
    <h1>Hotel Explorer V1</h1>
  </header>
  <main class="listings-grid" id="main-catalog">
    ${cardsHtml}
  </main>
</body>
</html>`;
}

function generateV2DOM(hotels) {
  // V2 renamed classes:
  // .hotel-card -> .property-card
  // .hotel-name -> .property-title
  // .price -> .amount
  // .rating -> .score
  // .location -> .address-text
  // .hotel-img -> .preview-thumb
  const cardsHtml = hotels.map((h, i) => `
    <article class="property-card" id="property-${i}">
      <div class="property-media">
        <img class="preview-thumb" src="${h.img}" alt="${h.name}" loading="lazy" />
      </div>
      <div class="property-details">
        <h3 class="property-title">${h.name}</h3>
        <div class="location-badge">
          <span class="address-text">${h.location}</span>
          <span class="score">${h.rating}</span>
        </div>
        <div class="pricing-container">
          <span class="amount">${h.price}</span>
        </div>
      </div>
    </article>
  `).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Luxury Hotel Listings (V2 Refactored)</title>
</head>
<body>
  <header class="site-header">
    <h1>Stays & Villas V2</h1>
  </header>
  <main class="catalog-container" id="results-stream">
    ${cardsHtml}
  </main>
</body>
</html>`;
}

function generateV3DOM(hotels) {
  // V3 uses semantic tags and data attributes:
  // [data-testid="stay-card"]
  // h3.title / [data-field="title"]
  // .nightly-rate / [data-field="price"]
  // .badge-rating / [data-field="rating"]
  // .city-tag / [data-field="location"]
  // .media-cover / [data-field="image"]
  const cardsHtml = hotels.map((h, i) => `
    <div class="stay-item" data-testid="stay-card" data-index="${i}">
      <div class="media-wrapper">
        <img class="media-cover" data-field="image" src="${h.img}" alt="${h.name}" />
      </div>
      <div class="info-section">
        <h3 class="title" data-field="title">${h.name}</h3>
        <div class="badges-row">
          <span class="city-tag" data-field="location">${h.location}</span>
          <span class="badge-rating" data-field="rating">${h.rating}</span>
        </div>
        <div class="cost-tag">
          <span class="nightly-rate" data-field="price">${h.price}</span>
        </div>
      </div>
    </div>
  `).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Luxury Hotel Listings (V3 Semantic Data)</title>
</head>
<body>
  <header class="app-nav">
    <h1>Travel Catalog V3</h1>
  </header>
  <section class="stays-feed">
    ${cardsHtml}
  </section>
</body>
</html>`;
}

export default { getSimulatedDOM, DEMO_HOTELS };
