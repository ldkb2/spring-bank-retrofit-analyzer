// Building Information Types
export type BuildingType =
  | 'multifamily'
  | 'office'
  | 'retail'
  | 'hotel'
  | 'healthcare'
  | 'education'
  | 'warehouse'
  | 'mixed-use';

export interface BuildingInfo {
  address: string;
  squareFootage: number;
  buildingType: BuildingType;
  yearBuilt: number;
  numberOfUnits?: number;
  numberOfFloors?: number;
}

// Energy Usage Types
export interface EnergyUsage {
  electricityKwh: number;
  naturalGasTherms: number;
  fuelOilGallons: number;
  steamMLbs: number;
  districtChilledWaterTonHrs: number;
}

// Retrofit Types
export type RetrofitCategory =
  | 'envelope'
  | 'hvac'
  | 'electrification'
  | 'solar'
  | 'lighting'
  | 'windows'
  | 'controls'
  | 'water';

export interface RetrofitOption {
  id: string;
  name: string;
  category: RetrofitCategory;
  description: string;
  estimatedCostPerSqFt: { low: number; high: number };
  estimatedEnergySavingsPercent: { low: number; high: number };
  emissionsReductionPercent: { low: number; high: number };
  paybackYears: { low: number; high: number };
  applicableBuildingTypes: BuildingType[] | 'all';
  icon: string;
}

// LL97 Types
export interface LL97Threshold {
  buildingType: BuildingType;
  year2024: number; // tCO2e per sqft
  year2030: number; // tCO2e per sqft
  year2035: number; // tCO2e per sqft
}

// Calculation Results
export interface ComplianceStatus {
  currentEmissions: number; // tCO2e
  emissionsIntensity: number; // tCO2e per sqft
  threshold2024: number;
  threshold2030: number;
  threshold2035: number;
  compliant2024: boolean;
  compliant2030: boolean;
  compliant2035: boolean;
  annualPenalty2024: number;
  annualPenalty2030: number;
  annualPenalty2035: number;
}

export interface RetrofitAnalysis {
  retrofitId: string;
  retrofitName: string;
  estimatedCost: { low: number; high: number };
  annualEnergySavings: { low: number; high: number };
  annualEmissionsReduction: { low: number; high: number };
  paybackPeriod: { low: number; high: number };
  ll97PenaltyAvoidance: { year2024: number; year2030: number; year2035: number };
}

export interface FinancialSummary {
  totalRetrofitCost: { low: number; high: number };
  annualEnergyCostSavings: { low: number; high: number };
  annualLL97PenaltyAvoidance: { year2024: number; year2030: number; year2035: number };
  totalAnnualSavings: { low: number; high: number };
  simplePayback: { low: number; high: number };
  tenYearNetSavings: { low: number; high: number };
  twentyYearNetSavings: { low: number; high: number };
}

export interface LoanRecommendation {
  loanType: string;
  description: string;
  typicalTerms: string;
  suitability: 'excellent' | 'good' | 'fair';
  reasons: string[];
}

export interface AnalysisResults {
  buildingInfo: BuildingInfo;
  energyUsage: EnergyUsage;
  selectedRetrofits: string[];
  complianceStatus: ComplianceStatus;
  retrofitAnalysis: RetrofitAnalysis[];
  financialSummary: FinancialSummary;
  loanRecommendations: LoanRecommendation[];
  postRetrofitCompliance: ComplianceStatus;
}

// Form State
export interface WizardState {
  currentStep: number;
  buildingInfo: Partial<BuildingInfo>;
  energyUsage: Partial<EnergyUsage>;
  selectedRetrofits: string[];
  results: AnalysisResults | null;
}
