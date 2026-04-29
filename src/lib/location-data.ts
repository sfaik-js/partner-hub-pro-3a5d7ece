export type LocationData = {
  [regional: string]: {
    [pays: string]: {
      [region: string]: string[];
    };
  };
};

export const LOCATION_DATA: LocationData = {
  Afrique: {
    Maroc: {
      "Casablanca-Settat": ["Casablanca", "Mohammedia", "El Jadida", "Settat"],
      "Rabat-Salé-Kénitra": ["Rabat", "Salé", "Kénitra", "Témara"],
      "Marrakech-Safi": ["Marrakech", "Safi", "Essaouira"],
      "Tanger-Tétouan-Al Hoceïma": ["Tanger", "Tétouan", "Al Hoceïma", "Larache"],
      "Fès-Meknès": ["Fès", "Meknès", "Ifrane", "Taza"],
    },
    Sénégal: {
      Dakar: ["Dakar", "Pikine", "Rufisque"],
      Thiès: ["Thiès", "Mbour", "Tivaouane"],
      "Saint-Louis": ["Saint-Louis", "Dagana", "Podor"],
    },
    "Côte d'Ivoire": {
      Abidjan: ["Abidjan", "Bingerville", "Anyama"],
      Yamoussoukro: ["Yamoussoukro", "Attiégouakro"],
      Bouaké: ["Bouaké", "Sakassou"],
    },
  },
  Europe: {
    France: {
      "Île-de-France": ["Paris", "Boulogne-Billancourt", "Versailles", "Nanterre"],
      "Auvergne-Rhône-Alpes": ["Lyon", "Grenoble", "Saint-Étienne", "Annecy"],
      "Provence-Alpes-Côte d'Azur": ["Marseille", "Nice", "Toulon", "Aix-en-Provence"],
      "Nouvelle-Aquitaine": ["Bordeaux", "Limoges", "Poitiers", "Pau"],
    },
    Belgique: {
      Bruxelles: ["Bruxelles", "Anderlecht", "Schaerbeek"],
      Flandre: ["Anvers", "Gand", "Bruges"],
      Wallonie: ["Charleroi", "Liège", "Namur"],
    },
    Suisse: {
      Genève: ["Genève", "Vernier", "Lancy"],
      Vaud: ["Lausanne", "Yverdon-les-Bains", "Montreux"],
      Zurich: ["Zurich", "Winterthour", "Uster"],
    },
  },
  Amérique: {
    Canada: {
      Québec: ["Montréal", "Québec", "Laval", "Gatineau"],
      Ontario: ["Toronto", "Ottawa", "Mississauga"],
      "Colombie-Britannique": ["Vancouver", "Victoria", "Surrey"],
    },
    "États-Unis": {
      Californie: ["Los Angeles", "San Francisco", "San Diego"],
      "New York": ["New York City", "Buffalo", "Albany"],
      Texas: ["Houston", "Austin", "Dallas"],
    },
  },
  Asie: {
    Japon: {
      Kantō: ["Tokyo", "Yokohama", "Chiba"],
      Kansai: ["Osaka", "Kyoto", "Kobe"],
    },
    "Émirats Arabes Unis": {
      "Abou Dabi": ["Abou Dabi", "Al-Aïn"],
      Dubaï: ["Dubaï"],
    },
  },
};

// Helper functions to fetch dynamic data
export const getRegionals = () => Object.keys(LOCATION_DATA);

export const getPays = (regional?: string) => {
  if (!regional || !LOCATION_DATA[regional]) return [];
  return Object.keys(LOCATION_DATA[regional]);
};

export const getRegions = (regional?: string, pays?: string) => {
  if (!regional || !pays || !LOCATION_DATA[regional]?.[pays]) return [];
  return Object.keys(LOCATION_DATA[regional][pays]);
};

export const getVilles = (regional?: string, pays?: string, region?: string) => {
  if (!regional || !pays || !region || !LOCATION_DATA[regional]?.[pays]?.[region]) return [];
  return LOCATION_DATA[regional][pays][region];
};
