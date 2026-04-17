// Geocoding utility to convert city names to coordinates
// This includes major Indian cities with their coordinates

const CITY_COORDINATES = {
    // Gujarat Cities
    'ahmedabad': { lat: 23.0225, lng: 72.5714 },
    'surat': { lat: 21.1702, lng: 72.8311 },
    'vadodara': { lat: 22.3072, lng: 73.1812 },
    'rajkot': { lat: 22.3039, lng: 70.8022 },
    'gandhinagar': { lat: 23.2156, lng: 72.6369 },
    'bhavnagar': { lat: 21.7645, lng: 72.1519 },
    'jamnagar': { lat: 22.4707, lng: 70.0577 },
    'junagadh': { lat: 21.5222, lng: 70.4579 },
    'anand': { lat: 22.5645, lng: 72.9289 },
    'bharuch': { lat: 21.7051, lng: 72.9959 },
    'patan': { lat: 23.8502, lng: 72.1262 },
    'morbi': { lat: 22.8173, lng: 70.8378 },
    'nadiad': { lat: 22.6939, lng: 72.8618 },
    'surendranagar': { lat: 22.7196, lng: 71.6369 },
    'vapi': { lat: 20.3712, lng: 72.9051 },
    
    // Major Indian Cities
    'mumbai': { lat: 19.0760, lng: 72.8777 },
    'delhi': { lat: 28.7041, lng: 77.1025 },
    'bangalore': { lat: 12.9716, lng: 77.5946 },
    'hyderabad': { lat: 17.3850, lng: 78.4867 },
    'chennai': { lat: 13.0827, lng: 80.2707 },
    'kolkata': { lat: 22.5726, lng: 88.3639 },
    'pune': { lat: 18.5204, lng: 73.8567 },
    'jaipur': { lat: 26.9124, lng: 75.7873 },
    'lucknow': { lat: 26.8467, lng: 80.9462 },
    'kanpur': { lat: 26.4499, lng: 80.3319 },
    'nagpur': { lat: 21.1458, lng: 79.0882 },
    'indore': { lat: 22.7196, lng: 75.8577 },
    'bhopal': { lat: 23.2599, lng: 77.4126 },
    'visakhapatnam': { lat: 17.6868, lng: 83.2185 },
    'patna': { lat: 25.5941, lng: 85.1376 },
    'ludhiana': { lat: 30.9010, lng: 75.8573 },
    'agra': { lat: 27.1767, lng: 78.0081 },
    'nashik': { lat: 19.9975, lng: 73.7898 },
    'faridabad': { lat: 28.4089, lng: 77.3178 },
    'meerut': { lat: 28.9845, lng: 77.7064 },
    'rajkot': { lat: 22.3039, lng: 70.8022 },
    'kalyan': { lat: 19.2403, lng: 73.1305 },
    'vasai': { lat: 19.4911, lng: 72.8054 },
    'varanasi': { lat: 25.3176, lng: 82.9739 },
    'srinagar': { lat: 34.0837, lng: 74.7973 },
    'aurangabad': { lat: 19.8762, lng: 75.3433 },
    'dhanbad': { lat: 23.7957, lng: 86.4304 },
    'amritsar': { lat: 31.6340, lng: 74.8723 },
    'navi mumbai': { lat: 19.0330, lng: 73.0297 },
    'allahabad': { lat: 25.4358, lng: 81.8463 },
    'ranchi': { lat: 23.3441, lng: 85.3096 },
    'howrah': { lat: 22.5958, lng: 88.2636 },
    'coimbatore': { lat: 11.0168, lng: 76.9558 },
    'jabalpur': { lat: 23.1815, lng: 79.9864 },
    'gwalior': { lat: 26.2183, lng: 78.1828 }
};

/**
 * Get coordinates for a city name
 * @param {string} cityName - Name of the city
 * @returns {object|null} - {lat, lng} coordinates or null if not found
 */
export function getCityCoordinates(cityName) {
    if (!cityName) return null;
    
    const normalizedCity = cityName.toLowerCase().trim();
    return CITY_COORDINATES[normalizedCity] || null;
}

/**
 * Get coordinates with fallback to Gujarat center
 * @param {string} cityName - Name of the city
 * @returns {object} - {lat, lng} coordinates (always returns valid coordinates)
 */
export function getCityCoordinatesWithFallback(cityName) {
    const coords = getCityCoordinates(cityName);
    
    // Fallback to Gujarat center if city not found
    return coords || { lat: 22.2587, lng: 71.1924 };
}

/**
 * Check if a city is supported
 * @param {string} cityName - Name of the city
 * @returns {boolean} - True if city is supported
 */
export function isCitySupported(cityName) {
    if (!cityName) return false;
    const normalizedCity = cityName.toLowerCase().trim();
    return normalizedCity in CITY_COORDINATES;
}

/**
 * Get all supported cities
 * @returns {string[]} - Array of supported city names
 */
export function getSupportedCities() {
    return Object.keys(CITY_COORDINATES).map(city => 
        city.charAt(0).toUpperCase() + city.slice(1)
    );
}