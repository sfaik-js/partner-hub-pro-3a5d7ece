// Structure: Regional → Pays → Région → Province → Ville[]
export type LocationData = {
  [regional: string]: {
    [pays: string]: {
      [region: string]: {
        [province: string]: string[];
      };
    };
  };
};

export const LOCATION_DATA: LocationData = {
  Afrique: {
    Maroc: {
      "Tanger-Tétouan-Al Hoceïma": {
        Tanger-Assilah: ["Tanger", "Assilah"],
        "M'diq-Fnideq": ["M'diq", "Fnideq"],
        Tétouan: ["Tétouan", "Martil"],
        Fahs-Anjra: ["Ksar Sghir"],
        Larache: ["Larache", "Ksar El Kébir"],
        "Al Hoceïma": ["Al Hoceïma", "Imzouren"],
        Chefchaouen: ["Chefchaouen"],
        Ouezzane: ["Ouezzane"],
      },
      "L'Oriental": {
        Oujda-Angad: ["Oujda"],
        Nador: ["Nador", "Zeghanghane"],
        Berkane: ["Berkane", "Saïdia"],
        Taourirt: ["Taourirt"],
        Jerada: ["Jerada"],
        Guercif: ["Guercif"],
        Driouch: ["Driouch"],
        Figuig: ["Figuig", "Bouarfa"],
      },
      "Fès-Meknès": {
        Fès: ["Fès"],
        Meknès: ["Meknès"],
        Taza: ["Taza"],
        Ifrane: ["Ifrane", "Azrou"],
        Séfrou: ["Séfrou"],
        "Moulay Yacoub": ["Moulay Yacoub"],
        "El Hajeb": ["El Hajeb"],
        Boulemane: ["Boulemane", "Missour"],
        Taounate: ["Taounate"],
      },
      "Rabat-Salé-Kénitra": {
        Rabat: ["Rabat"],
        Salé: ["Salé"],
        Témara: ["Témara"],
        Kénitra: ["Kénitra"],
        Skhirate-Témara: ["Skhirate", "Témara"],
        Khémisset: ["Khémisset", "Tiflet"],
        "Sidi Kacem": ["Sidi Kacem"],
        "Sidi Slimane": ["Sidi Slimane"],
      },
      "Béni Mellal-Khénifra": {
        "Béni Mellal": ["Béni Mellal"],
        Khénifra: ["Khénifra"],
        Khouribga: ["Khouribga", "Oued Zem"],
        "Fquih Ben Salah": ["Fquih Ben Salah"],
        Azilal: ["Azilal"],
      },
      "Casablanca-Settat": {
        Casablanca: ["Casablanca"],
        Mohammedia: ["Mohammedia"],
        "El Jadida": ["El Jadida", "Azemmour"],
        Settat: ["Settat"],
        Berrechid: ["Berrechid"],
        Benslimane: ["Benslimane"],
        Médiouna: ["Médiouna"],
        "Nouaceur": ["Nouaceur"],
        "Sidi Bennour": ["Sidi Bennour"],
      },
      "Marrakech-Safi": {
        Marrakech: ["Marrakech"],
        Safi: ["Safi"],
        Essaouira: ["Essaouira"],
        "El Kelâa des Sraghna": ["El Kelâa des Sraghna"],
        Chichaoua: ["Chichaoua"],
        "Al Haouz": ["Tahanaout", "Amizmiz"],
        Rehamna: ["Ben Guérir"],
        Youssoufia: ["Youssoufia"],
      },
      "Drâa-Tafilalet": {
        Errachidia: ["Errachidia"],
        Ouarzazate: ["Ouarzazate"],
        Tinghir: ["Tinghir"],
        Zagora: ["Zagora"],
        Midelt: ["Midelt"],
      },
      "Souss-Massa": {
        Agadir: ["Agadir", "Inezgane", "Aït Melloul"],
        Tiznit: ["Tiznit"],
        Taroudant: ["Taroudant"],
        "Chtouka-Aït Baha": ["Biougra"],
        "Inezgane-Aït Melloul": ["Inezgane", "Aït Melloul"],
        Tata: ["Tata"],
      },
      "Guelmim-Oued Noun": {
        Guelmim: ["Guelmim"],
        "Tan-Tan": ["Tan-Tan"],
        "Sidi Ifni": ["Sidi Ifni"],
        "Assa-Zag": ["Assa"],
      },
      "Laâyoune-Sakia El Hamra": {
        Laâyoune: ["Laâyoune"],
        Boujdour: ["Boujdour"],
        Tarfaya: ["Tarfaya"],
        "Es-Semara": ["Es-Semara"],
      },
      "Dakhla-Oued Ed-Dahab": {
        "Oued Ed-Dahab": ["Dakhla"],
        Aousserd: ["Aousserd"],
      },
    },
    Sénégal: {
      Dakar: {
        Dakar: ["Dakar", "Pikine", "Rufisque"],
      },
      Thiès: {
        Thiès: ["Thiès", "Mbour", "Tivaouane"],
      },
      "Saint-Louis": {
        "Saint-Louis": ["Saint-Louis", "Dagana", "Podor"],
      },
    },
    "Côte d'Ivoire": {
      Abidjan: {
        Abidjan: ["Abidjan", "Bingerville", "Anyama"],
      },
      Yamoussoukro: {
        Yamoussoukro: ["Yamoussoukro", "Attiégouakro"],
      },
      Bouaké: {
        Bouaké: ["Bouaké", "Sakassou"],
      },
    },
  },
  Europe: {
    France: {
      "Île-de-France": {
        Paris: ["Paris", "Boulogne-Billancourt", "Versailles", "Nanterre"],
      },
      "Auvergne-Rhône-Alpes": {
        Rhône: ["Lyon", "Villeurbanne"],
        Isère: ["Grenoble"],
        Loire: ["Saint-Étienne"],
        "Haute-Savoie": ["Annecy"],
      },
      "Provence-Alpes-Côte d'Azur": {
        "Bouches-du-Rhône": ["Marseille", "Aix-en-Provence"],
        "Alpes-Maritimes": ["Nice"],
        Var: ["Toulon"],
      },
      "Nouvelle-Aquitaine": {
        Gironde: ["Bordeaux"],
        "Haute-Vienne": ["Limoges"],
        Vienne: ["Poitiers"],
        "Pyrénées-Atlantiques": ["Pau"],
      },
    },
    Belgique: {
      Bruxelles: {
        Bruxelles: ["Bruxelles", "Anderlecht", "Schaerbeek"],
      },
      Flandre: {
        Anvers: ["Anvers"],
        "Flandre-Orientale": ["Gand"],
        "Flandre-Occidentale": ["Bruges"],
      },
      Wallonie: {
        Hainaut: ["Charleroi"],
        Liège: ["Liège"],
        Namur: ["Namur"],
      },
    },
    Suisse: {
      Genève: {
        Genève: ["Genève", "Vernier", "Lancy"],
      },
      Vaud: {
        Vaud: ["Lausanne", "Yverdon-les-Bains", "Montreux"],
      },
      Zurich: {
        Zurich: ["Zurich", "Winterthour", "Uster"],
      },
    },
  },
  Amérique: {
    Canada: {
      Québec: {
        Québec: ["Montréal", "Québec", "Laval", "Gatineau"],
      },
      Ontario: {
        Ontario: ["Toronto", "Ottawa", "Mississauga"],
      },
      "Colombie-Britannique": {
        "Colombie-Britannique": ["Vancouver", "Victoria", "Surrey"],
      },
    },
    "États-Unis": {
      Californie: {
        Californie: ["Los Angeles", "San Francisco", "San Diego"],
      },
      "New York": {
        "New York": ["New York City", "Buffalo", "Albany"],
      },
      Texas: {
        Texas: ["Houston", "Austin", "Dallas"],
      },
    },
  },
  Asie: {
    Japon: {
      Kantō: {
        Tokyo: ["Tokyo", "Yokohama", "Chiba"],
      },
      Kansai: {
        Osaka: ["Osaka", "Kyoto", "Kobe"],
      },
    },
    "Émirats Arabes Unis": {
      "Abou Dabi": {
        "Abou Dabi": ["Abou Dabi", "Al-Aïn"],
      },
      Dubaï: {
        Dubaï: ["Dubaï"],
      },
    },
  },
};

// Helper functions
export const getRegionals = () => Object.keys(LOCATION_DATA);

export const getPays = (regional?: string) => {
  if (!regional || !LOCATION_DATA[regional]) return [];
  return Object.keys(LOCATION_DATA[regional]);
};

export const getRegions = (regional?: string, pays?: string) => {
  if (!regional || !pays || !LOCATION_DATA[regional]?.[pays]) return [];
  return Object.keys(LOCATION_DATA[regional][pays]);
};

export const getProvinces = (regional?: string, pays?: string, region?: string) => {
  if (!regional || !pays || !region || !LOCATION_DATA[regional]?.[pays]?.[region]) return [];
  return Object.keys(LOCATION_DATA[regional][pays][region]);
};

export const getVilles = (regional?: string, pays?: string, region?: string, province?: string) => {
  if (!regional || !pays || !region || !province || !LOCATION_DATA[regional]?.[pays]?.[region]?.[province]) return [];
  return LOCATION_DATA[regional][pays][region][province];
};
