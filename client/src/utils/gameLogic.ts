/**
 * Game logic utilities for the Pandemic Game
 */
import { Cities, CityConnection, Diseases, DiseaseColor } from '../types';

/**
 * Checks if two cities are directly connected
 * @param {string} city1 - First city name
 * @param {string} city2 - Second city name
 * @param {Array} connections - Array of connections between cities
 * @returns {boolean} - Whether the cities are connected
 */
export function areCitiesConnected(city1: string, city2: string, connections: CityConnection[]): boolean {
  return connections.some(conn => 
    (conn[0] === city1 && conn[1] === city2) || 
    (conn[0] === city2 && conn[1] === city1)
  );
}

/**
 * Generates a random infection of cities
 * @param {Object} cities - Object containing city data
 * @param {number} count - Number of cities to infect
 * @param {number} cubes - Number of cubes to place in each city
 * @returns {Object} - Updated cities object with new infections
 */
export function infectCities(cities: Cities, count: number, cubes: number): Cities {
  const updatedCities = { ...cities };
  const cityNames = Object.keys(updatedCities);
  const infectedCities: string[] = [];
  
  // Select random cities to infect
  for (let i = 0; i < count; i++) {
    let randomCity: string;
    // Avoid infecting the same city twice
    do {
      randomCity = cityNames[Math.floor(Math.random() * cityNames.length)];
    } while (infectedCities.includes(randomCity));
    
    infectedCities.push(randomCity);
    const cityColor = updatedCities[randomCity].color;
    updatedCities[randomCity].infections[cityColor] += cubes;
  }
  
  return updatedCities;
}

/**
 * Checks if all diseases are cured
 * @param {Object} diseases - Object containing disease cure status
 * @returns {boolean} - Whether all diseases are cured
 */
export function checkAllDiseasesCured(diseases: Diseases): boolean {
  return Object.values(diseases).every(disease => disease.cured);
}

/**
 * Processes an outbreak in a city by infecting neighboring cities
 * @param {string} cityName - Name of the city with an outbreak
 * @param {string} diseaseColor - Color of the disease causing the outbreak
 * @param {Object} cities - Object containing city data
 * @param {Array} connections - Array of connections between cities
 * @param {Set} outbreakChain - Set of cities that have already had outbreaks in this chain
 * @returns {Object} - Updated cities object after outbreak propagation
 */
export function processOutbreak(
  cityName: string, 
  diseaseColor: DiseaseColor, 
  cities: Cities, 
  connections: CityConnection[], 
  outbreakChain: Set<string> = new Set()
): Cities {
  // Mark this city as having an outbreak
  outbreakChain.add(cityName);
  
  // Find all cities connected to this one
  const neighborCities = connections
    .filter(conn => conn[0] === cityName || conn[1] === cityName)
    .map(conn => conn[0] === cityName ? conn[1] : conn[0]);
  
  let updatedCities = { ...cities };
  
  // Infect each neighboring city
  neighborCities.forEach(neighbor => {
    updatedCities[neighbor] = {
      ...updatedCities[neighbor],
      infections: {
        ...updatedCities[neighbor].infections,
        [diseaseColor]: updatedCities[neighbor].infections[diseaseColor] + 1
      }
    };
    
    // Check if this infection caused another outbreak
    if (updatedCities[neighbor].infections[diseaseColor] > 3 && !outbreakChain.has(neighbor)) {
      // Cap infections at 3
      updatedCities[neighbor].infections[diseaseColor] = 3;
      
      // Recursively process chain outbreaks
      updatedCities = processOutbreak(neighbor, diseaseColor, updatedCities, connections, outbreakChain);
    }
  });
  
  return updatedCities;
}

/**
 * Generate a unique game ID
 * @returns {string} - Unique 6-character game ID
 */
export function generateGameId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Generate a unique player ID
 * @returns {string} - Unique player ID
 */
export function generatePlayerId(): string {
  return Math.random().toString(36).substring(2, 10);
}
