// Place this inside main.js or similar, and ensure it's properly referenced from your HTML

// API or static JSON file location (ensure path is correct for your deployment)
const DATA_URL = 'travel_recommendation_api.json';

// DOM elements
const searchInput = document.getElementById('searchInput'); // input field with id=searchInput in navbar
const searchBtn = document.querySelector('.search-btn');    // button with class 'search-btn'
const clearBtn = document.querySelector('.clear-btn');      // button with class 'clear-btn'
const resultsContainer = document.getElementById('searchResults'); // container for recommendations

// Utility: Mapping for variations
const keywordMap = {
  beach: ['beach', 'beaches'],
  temple: ['temple', 'temples'],
  country: ['country', 'countries']
};

// Normalize user input to keyword base (returns null if no match)
function normalizeKeyword(input) {
  const key = input.trim().toLowerCase();
  for (const base of Object.keys(keywordMap)) {
    if (keywordMap[base].includes(key)) {
      return base;
    }
  }
  // Also handle pluralization and upper-case
  const singularMatch = Object.keys(keywordMap).find(
    base => keywordMap[base].some(word => word === key)
  );
  return singularMatch || null;
}

// Flexible: Also check plural/singular/uppercase
function detectKeyword(input) {
  input = input.trim().toLowerCase();
  // Remove trailing 'es' or 's' for plural
  let base = input.replace(/es$/, '').replace(/s$/, '');
  for (let mapKey in keywordMap) {
    if (keywordMap[mapKey].includes(input) || mapKey === base) return mapKey;
  }
  return null;
}

// Fetch recommendations from JSON
async function fetchRecommendations() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error('Unable to load data');
  return await response.json();
}

// Render a single recommendation card
function renderCard({ name, imageUrl, description }) {
  return `
    <div class="recommend-card" style="background:white; border-radius:18px; margin-bottom:24px; overflow:hidden; box-shadow:0 4px 14px rgba(30,30,40,0.06); max-width:480px;">
      <img src="${imageUrl}" alt="${name}" style="width:100%; height:220px; object-fit:cover; border-radius:14px 14px 0 0;">
      <div style="padding:16px 18px 18px 18px;">
        <div style="font-size:1.22rem; color:#134d74; font-weight:bold; margin-bottom:4px; text-decoration:underline;">${name}</div>
        <div style="font-size:1.02rem; color:#636468; margin-bottom:14px;">${description}</div>
        <button style="background:#099076; color:#fff; border:none; border-radius:8px; padding:8px 32px; font-weight:600; cursor:pointer;">Visit</button>
      </div>
    </div>
  `;
}

// Handle Search button click
searchBtn.addEventListener('click', async function() {
  const keyword = detectKeyword(searchInput.value);
  // Remove previous results
  resultsContainer.innerHTML = '';
  if (!keyword) {
    resultsContainer.innerHTML = `<div style="color:#e53e3e; background:rgba(230,40,40,0.1); padding:10px 20px; border-radius:10px; margin-top:16px;">Please enter a valid travel keyword.<br>Try: beach, temple, or country.</div>`;
    return;
  }
  // Fetch data and filter by type
  try {
    const data = await fetchRecommendations();
    let items = [];
    if (keyword === "beach") {
      items = data.beaches || [];
    } else if (keyword === "temple") {
      items = data.temples || [];
    } else if (keyword === "country") {
      // country: show at least two country city recommendations (e.g., Australia, Japan, Brazil from sample)
      items = [];
      if (data.countries) {
        // Extract city/country combos as recommended destinations
        data.countries.forEach(country => {
          if (country.cities) {
            country.cities.forEach(city => {
              items.push({
                name: city.name,
                imageUrl: city.imageUrl,
                description: city.description
              });
            });
          }
        });
      }
    }

    if (items.length === 0) {
      resultsContainer.innerHTML = `<div style="color:#e53e3e; background:rgba(230,40,40,0.1); padding:10px 20px; border-radius:10px; margin-top:16px;">No results found for this keyword.</div>`;
      return;
    }

    // Ensure at least 2 recommendations displayed
    let html = items.slice(0,2).map(renderCard).join('');
    resultsContainer.innerHTML = html;

  } catch (err) {
    resultsContainer.innerHTML = `<div style="color:#e53e3e; background:rgba(230,40,40,0.1); padding:10px 20px; border-radius:10px; margin-top:16px;">Failed to load recommendations.</div>`;
  }
});

// Handle Clear button click
clearBtn.addEventListener('click', function() {
  searchInput.value = '';
  resultsContainer.innerHTML = '';
});

