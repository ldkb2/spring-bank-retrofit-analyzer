import type { BuildingType, LL97Threshold } from '../types';

// LL97 Carbon Emission Limits (tCO2e per square foot per year)
// Source: NYC Local Law 97 - these are approximate values for illustration
export const ll97Thresholds: LL97Threshold[] = [
  {
    buildingType: 'multifamily',
    year2024: 0.00675, // 6.75 kgCO2e/sf = 0.00675 tCO2e/sf
    year2030: 0.00407,
    year2035: 0.00268,
  },
  {
    buildingType: 'office',
    year2024: 0.00846,
    year2030: 0.00453,
    year2035: 0.00298,
  },
  {
    buildingType: 'retail',
    year2024: 0.01181,
    year2030: 0.00574,
    year2035: 0.00378,
  },
  {
    buildingType: 'hotel',
    year2024: 0.00951,
    year2030: 0.00526,
    year2035: 0.00347,
  },
  {
    buildingType: 'healthcare',
    year2024: 0.02381,
    year2030: 0.01276,
    year2035: 0.00841,
  },
  {
    buildingType: 'education',
    year2024: 0.00758,
    year2030: 0.00407,
    year2035: 0.00268,
  },
  {
    buildingType: 'warehouse',
    year2024: 0.00411,
    year2030: 0.00220,
    year2035: 0.00145,
  },
  {
    buildingType: 'mixed-use',
    year2024: 0.00758, // Using average of common building types
    year2030: 0.00430,
    year2035: 0.00283,
  },
];

// LL97 Penalty Rate
export const LL97_PENALTY_RATE = 268; // $ per tCO2e over the limit

// Emission Factors (tCO2e per unit)
export const emissionFactors = {
  electricity: 0.000288, // tCO2e per kWh (NYC grid, approximate)
  naturalGas: 0.00531, // tCO2e per therm
  fuelOil2: 0.01018, // tCO2e per gallon (#2 fuel oil)
  fuelOil4: 0.01098, // tCO2e per gallon (#4 fuel oil)
  steam: 0.04493, // tCO2e per MLb (district steam)
  chilledWater: 0.000185, // tCO2e per ton-hour
};

// Energy Cost Rates (NYC approximate rates)
export const energyCostRates = {
  electricity: 0.22, // $ per kWh
  naturalGas: 1.50, // $ per therm
  fuelOil: 3.50, // $ per gallon
  steam: 35.0, // $ per MLb
  chilledWater: 0.15, // $ per ton-hour
};

// Building type labels for display
export const buildingTypeLabels: Record<BuildingType, string> = {
  multifamily: 'Multifamily Residential',
  office: 'Office',
  retail: 'Retail',
  hotel: 'Hotel',
  healthcare: 'Healthcare',
  education: 'Education',
  warehouse: 'Warehouse / Storage',
  'mixed-use': 'Mixed-Use',
};

// Typical EUI (Energy Use Intensity) by building type (kBtu per sqft per year)
// Used for estimating energy usage if not provided
export const typicalEUI: Record<BuildingType, { median: number; range: { low: number; high: number } }> = {
  multifamily: { median: 85, range: { low: 50, high: 150 } },
  office: { median: 90, range: { low: 60, high: 140 } },
  retail: { median: 75, range: { low: 40, high: 130 } },
  hotel: { median: 110, range: { low: 70, high: 180 } },
  healthcare: { median: 200, range: { low: 120, high: 350 } },
  education: { median: 85, range: { low: 50, high: 140 } },
  warehouse: { median: 35, range: { low: 15, high: 70 } },
  'mixed-use': { median: 90, range: { low: 55, high: 150 } },
};

// Helper function to get LL97 threshold for a building type
export function getLL97Threshold(buildingType: BuildingType): LL97Threshold | undefined {
  return ll97Thresholds.find((t) => t.buildingType === buildingType);
}
