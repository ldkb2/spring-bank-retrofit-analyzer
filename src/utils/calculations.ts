import type {
  BuildingInfo,
  EnergyUsage,
  ComplianceStatus,
  RetrofitAnalysis,
  FinancialSummary,
  LoanRecommendation,
  AnalysisResults,
} from '../types';
import { retrofitOptions } from '../data/retrofitOptions';
import {
  getLL97Threshold,
  emissionFactors,
  energyCostRates,
  LL97_PENALTY_RATE,
} from '../data/ll97Data';

// Calculate total annual emissions from energy usage
export function calculateEmissions(energyUsage: EnergyUsage): number {
  const electricityEmissions = energyUsage.electricityKwh * emissionFactors.electricity;
  const gasEmissions = energyUsage.naturalGasTherms * emissionFactors.naturalGas;
  const oilEmissions = energyUsage.fuelOilGallons * emissionFactors.fuelOil2;
  const steamEmissions = energyUsage.steamMLbs * emissionFactors.steam;
  const chilledWaterEmissions = energyUsage.districtChilledWaterTonHrs * emissionFactors.chilledWater;

  return electricityEmissions + gasEmissions + oilEmissions + steamEmissions + chilledWaterEmissions;
}

// Calculate annual energy costs
export function calculateEnergyCosts(energyUsage: EnergyUsage): number {
  const electricityCost = energyUsage.electricityKwh * energyCostRates.electricity;
  const gasCost = energyUsage.naturalGasTherms * energyCostRates.naturalGas;
  const oilCost = energyUsage.fuelOilGallons * energyCostRates.fuelOil;
  const steamCost = energyUsage.steamMLbs * energyCostRates.steam;
  const chilledWaterCost = energyUsage.districtChilledWaterTonHrs * energyCostRates.chilledWater;

  return electricityCost + gasCost + oilCost + steamCost + chilledWaterCost;
}

// Calculate LL97 compliance status
export function calculateComplianceStatus(
  buildingInfo: BuildingInfo,
  energyUsage: EnergyUsage
): ComplianceStatus {
  const threshold = getLL97Threshold(buildingInfo.buildingType);
  const currentEmissions = calculateEmissions(energyUsage);
  const emissionsIntensity = currentEmissions / buildingInfo.squareFootage;

  const threshold2024 = threshold?.year2024 ?? 0;
  const threshold2030 = threshold?.year2030 ?? 0;
  const threshold2035 = threshold?.year2035 ?? 0;

  const allowedEmissions2024 = threshold2024 * buildingInfo.squareFootage;
  const allowedEmissions2030 = threshold2030 * buildingInfo.squareFootage;
  const allowedEmissions2035 = threshold2035 * buildingInfo.squareFootage;

  const excessEmissions2024 = Math.max(0, currentEmissions - allowedEmissions2024);
  const excessEmissions2030 = Math.max(0, currentEmissions - allowedEmissions2030);
  const excessEmissions2035 = Math.max(0, currentEmissions - allowedEmissions2035);

  return {
    currentEmissions,
    emissionsIntensity,
    threshold2024,
    threshold2030,
    threshold2035,
    compliant2024: excessEmissions2024 === 0,
    compliant2030: excessEmissions2030 === 0,
    compliant2035: excessEmissions2035 === 0,
    annualPenalty2024: excessEmissions2024 * LL97_PENALTY_RATE,
    annualPenalty2030: excessEmissions2030 * LL97_PENALTY_RATE,
    annualPenalty2035: excessEmissions2035 * LL97_PENALTY_RATE,
  };
}

// Analyze individual retrofit options
export function analyzeRetrofits(
  buildingInfo: BuildingInfo,
  energyUsage: EnergyUsage,
  selectedRetrofitIds: string[],
  currentCompliance: ComplianceStatus
): RetrofitAnalysis[] {
  const currentEnergyCost = calculateEnergyCosts(energyUsage);
  const currentEmissions = currentCompliance.currentEmissions;

  return selectedRetrofitIds.map((retrofitId) => {
    const retrofit = retrofitOptions.find((r) => r.id === retrofitId);
    if (!retrofit) {
      throw new Error(`Retrofit option not found: ${retrofitId}`);
    }

    // Calculate costs based on building size
    const estimatedCost = {
      low: retrofit.estimatedCostPerSqFt.low * buildingInfo.squareFootage,
      high: retrofit.estimatedCostPerSqFt.high * buildingInfo.squareFootage,
    };

    // Calculate energy savings
    const annualEnergySavings = {
      low: currentEnergyCost * (retrofit.estimatedEnergySavingsPercent.low / 100),
      high: currentEnergyCost * (retrofit.estimatedEnergySavingsPercent.high / 100),
    };

    // Calculate emissions reduction
    const annualEmissionsReduction = {
      low: currentEmissions * (retrofit.emissionsReductionPercent.low / 100),
      high: currentEmissions * (retrofit.emissionsReductionPercent.high / 100),
    };

    // Calculate payback periods
    const paybackPeriod = {
      low: estimatedCost.low / annualEnergySavings.high,
      high: estimatedCost.high / annualEnergySavings.low,
    };

    // Calculate LL97 penalty avoidance (based on emissions reduction)
    const avgEmissionsReduction = (annualEmissionsReduction.low + annualEmissionsReduction.high) / 2;
    const newEmissions = currentEmissions - avgEmissionsReduction;

    const threshold = getLL97Threshold(buildingInfo.buildingType);
    const allowedEmissions2024 = (threshold?.year2024 ?? 0) * buildingInfo.squareFootage;
    const allowedEmissions2030 = (threshold?.year2030 ?? 0) * buildingInfo.squareFootage;
    const allowedEmissions2035 = (threshold?.year2035 ?? 0) * buildingInfo.squareFootage;

    const newExcess2024 = Math.max(0, newEmissions - allowedEmissions2024);
    const newExcess2030 = Math.max(0, newEmissions - allowedEmissions2030);
    const newExcess2035 = Math.max(0, newEmissions - allowedEmissions2035);

    const ll97PenaltyAvoidance = {
      year2024: currentCompliance.annualPenalty2024 - (newExcess2024 * LL97_PENALTY_RATE),
      year2030: currentCompliance.annualPenalty2030 - (newExcess2030 * LL97_PENALTY_RATE),
      year2035: currentCompliance.annualPenalty2035 - (newExcess2035 * LL97_PENALTY_RATE),
    };

    return {
      retrofitId,
      retrofitName: retrofit.name,
      estimatedCost,
      annualEnergySavings,
      annualEmissionsReduction,
      paybackPeriod,
      ll97PenaltyAvoidance,
    };
  });
}

// Calculate financial summary for all selected retrofits
export function calculateFinancialSummary(
  retrofitAnalysis: RetrofitAnalysis[],
  currentCompliance: ComplianceStatus
): FinancialSummary {
  // Sum up all retrofit costs and savings
  const totalRetrofitCost = retrofitAnalysis.reduce(
    (acc, r) => ({
      low: acc.low + r.estimatedCost.low,
      high: acc.high + r.estimatedCost.high,
    }),
    { low: 0, high: 0 }
  );

  // Note: Energy savings don't simply add up - there's diminishing returns
  // Using a factor to account for overlap between measures
  const overlapFactor = retrofitAnalysis.length > 1 ? 0.85 : 1;

  const annualEnergyCostSavings = {
    low: retrofitAnalysis.reduce((acc, r) => acc + r.annualEnergySavings.low, 0) * overlapFactor,
    high: retrofitAnalysis.reduce((acc, r) => acc + r.annualEnergySavings.high, 0) * overlapFactor,
  };

  // Note: Total emissions reduction available for future enhanced penalty calculations
  // Currently using simplified approach with current compliance penalties

  // Recalculate penalties based on new emissions
  const annualLL97PenaltyAvoidance = {
    year2024: Math.max(0, currentCompliance.annualPenalty2024),
    year2030: Math.max(0, currentCompliance.annualPenalty2030),
    year2035: Math.max(0, currentCompliance.annualPenalty2035),
  };

  // Total annual savings including energy and penalty avoidance
  const totalAnnualSavings = {
    low: annualEnergyCostSavings.low + annualLL97PenaltyAvoidance.year2024,
    high: annualEnergyCostSavings.high + annualLL97PenaltyAvoidance.year2030,
  };

  // Simple payback calculation
  const simplePayback = {
    low: totalRetrofitCost.low / totalAnnualSavings.high,
    high: totalRetrofitCost.high / totalAnnualSavings.low,
  };

  // Long-term savings projections
  // Note: avgAnnualSavings and avgCost available for future NPV calculations

  const tenYearNetSavings = {
    low: (totalAnnualSavings.low * 10) - totalRetrofitCost.high,
    high: (totalAnnualSavings.high * 10) - totalRetrofitCost.low,
  };

  const twentyYearNetSavings = {
    low: (totalAnnualSavings.low * 20) - totalRetrofitCost.high,
    high: (totalAnnualSavings.high * 20) - totalRetrofitCost.low,
  };

  return {
    totalRetrofitCost,
    annualEnergyCostSavings,
    annualLL97PenaltyAvoidance,
    totalAnnualSavings,
    simplePayback,
    tenYearNetSavings,
    twentyYearNetSavings,
  };
}

// Generate loan recommendations based on project characteristics
export function generateLoanRecommendations(
  _buildingInfo: BuildingInfo, // Reserved for future building-specific recommendations
  financialSummary: FinancialSummary,
  retrofitIds: string[]
): LoanRecommendation[] {
  const recommendations: LoanRecommendation[] = [];
  const avgProjectCost = (financialSummary.totalRetrofitCost.low + financialSummary.totalRetrofitCost.high) / 2;
  const avgPayback = (financialSummary.simplePayback.low + financialSummary.simplePayback.high) / 2;

  // Check if electrification or clean energy retrofits are included
  const hasElectrification = retrofitIds.some((id) =>
    ['heat-pump-space', 'heat-pump-water', 'induction-cooking', 'rooftop-solar'].includes(id)
  );
  const hasSolar = retrofitIds.includes('rooftop-solar');

  // PACE Financing
  if (avgProjectCost > 50000) {
    recommendations.push({
      loanType: 'C-PACE Financing',
      description: 'Commercial Property Assessed Clean Energy financing allows you to finance energy improvements through a property tax assessment.',
      typicalTerms: '15-25 year terms, fixed rates typically 5-8%, transfers with property sale',
      suitability: hasElectrification ? 'excellent' : 'good',
      reasons: [
        'Long repayment terms match the life of improvements',
        'Payments may be passed through to tenants',
        'No upfront capital required',
        hasElectrification ? 'Clean energy projects often qualify for favorable rates' : 'Energy efficiency projects qualify',
      ].filter(Boolean) as string[],
    });
  }

  // Green Loan / Energy Efficiency Loan
  recommendations.push({
    loanType: 'Spring Bank Green Loan',
    description: 'A dedicated financing product for building energy improvements and LL97 compliance projects.',
    typicalTerms: '5-15 year terms, competitive fixed rates, flexible payment structures',
    suitability: avgPayback <= 10 ? 'excellent' : 'good',
    reasons: [
      'Designed specifically for building retrofits',
      'Competitive rates for qualifying projects',
      avgPayback <= 10 ? 'Strong payback period supports favorable terms' : 'Project savings support debt service',
      'Local lender with expertise in NYC building regulations',
    ],
  });

  // Solar-specific financing
  if (hasSolar) {
    recommendations.push({
      loanType: 'Solar Financing / PPA',
      description: 'Specialized solar financing including Power Purchase Agreements (PPA) or solar loans.',
      typicalTerms: 'PPAs: 15-25 years, no upfront cost; Loans: 5-15 years, rates vary',
      suitability: 'excellent',
      reasons: [
        'Solar-specific financing may offer better terms',
        'Federal ITC and state incentives can reduce net cost',
        'PPAs transfer performance risk to installer',
        'May qualify for additional green building incentives',
      ],
    });
  }

  // NYSERDA financing
  recommendations.push({
    loanType: 'NYSERDA Financing Programs',
    description: 'New York State Energy Research and Development Authority offers various financing and incentive programs.',
    typicalTerms: 'Varies by program; may include low-interest loans, on-bill financing, or incentives',
    suitability: hasElectrification ? 'excellent' : 'good',
    reasons: [
      'State-backed programs often offer below-market rates',
      'May be combined with other financing',
      hasElectrification ? 'Electrification projects may qualify for additional incentives' : 'Energy efficiency incentives available',
      'Technical assistance often included',
    ].filter(Boolean) as string[],
  });

  // Construction / Renovation Loan
  if (avgProjectCost > 500000) {
    recommendations.push({
      loanType: 'Construction / Renovation Loan',
      description: 'For comprehensive retrofit projects, a construction loan can provide staged financing during the improvement phase.',
      typicalTerms: '12-36 month construction period, then converts to permanent financing',
      suitability: 'good',
      reasons: [
        'Appropriate for large-scale comprehensive retrofits',
        'Draw schedule matches project milestones',
        'Can refinance into permanent loan upon completion',
        'May incorporate energy savings into underwriting',
      ],
    });
  }

  return recommendations;
}

// Calculate post-retrofit compliance status
export function calculatePostRetrofitCompliance(
  buildingInfo: BuildingInfo,
  energyUsage: EnergyUsage,
  retrofitAnalysis: RetrofitAnalysis[]
): ComplianceStatus {
  const currentCompliance = calculateComplianceStatus(buildingInfo, energyUsage);

  // Calculate total emissions reduction (with overlap factor for multiple retrofits)
  const overlapFactor = retrofitAnalysis.length > 1 ? 0.85 : 1;
  const totalEmissionsReduction = retrofitAnalysis.reduce(
    (acc, r) => acc + (r.annualEmissionsReduction.low + r.annualEmissionsReduction.high) / 2,
    0
  ) * overlapFactor;

  const newEmissions = Math.max(0, currentCompliance.currentEmissions - totalEmissionsReduction);
  const newEmissionsIntensity = newEmissions / buildingInfo.squareFootage;

  const threshold = getLL97Threshold(buildingInfo.buildingType);
  const allowedEmissions2024 = (threshold?.year2024 ?? 0) * buildingInfo.squareFootage;
  const allowedEmissions2030 = (threshold?.year2030 ?? 0) * buildingInfo.squareFootage;
  const allowedEmissions2035 = (threshold?.year2035 ?? 0) * buildingInfo.squareFootage;

  const newExcess2024 = Math.max(0, newEmissions - allowedEmissions2024);
  const newExcess2030 = Math.max(0, newEmissions - allowedEmissions2030);
  const newExcess2035 = Math.max(0, newEmissions - allowedEmissions2035);

  return {
    currentEmissions: newEmissions,
    emissionsIntensity: newEmissionsIntensity,
    threshold2024: currentCompliance.threshold2024,
    threshold2030: currentCompliance.threshold2030,
    threshold2035: currentCompliance.threshold2035,
    compliant2024: newExcess2024 === 0,
    compliant2030: newExcess2030 === 0,
    compliant2035: newExcess2035 === 0,
    annualPenalty2024: newExcess2024 * LL97_PENALTY_RATE,
    annualPenalty2030: newExcess2030 * LL97_PENALTY_RATE,
    annualPenalty2035: newExcess2035 * LL97_PENALTY_RATE,
  };
}

// Main function to run full analysis
export function runFullAnalysis(
  buildingInfo: BuildingInfo,
  energyUsage: EnergyUsage,
  selectedRetrofitIds: string[]
): AnalysisResults {
  const complianceStatus = calculateComplianceStatus(buildingInfo, energyUsage);
  const retrofitAnalysis = analyzeRetrofits(buildingInfo, energyUsage, selectedRetrofitIds, complianceStatus);
  const financialSummary = calculateFinancialSummary(retrofitAnalysis, complianceStatus);
  const loanRecommendations = generateLoanRecommendations(buildingInfo, financialSummary, selectedRetrofitIds);
  const postRetrofitCompliance = calculatePostRetrofitCompliance(buildingInfo, energyUsage, retrofitAnalysis);

  return {
    buildingInfo,
    energyUsage,
    selectedRetrofits: selectedRetrofitIds,
    complianceStatus,
    retrofitAnalysis,
    financialSummary,
    loanRecommendations,
    postRetrofitCompliance,
  };
}

// Utility function to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Utility function to format large numbers
export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

// Format a range of values
export function formatRange(range: { low: number; high: number }, formatter: (n: number) => string): string {
  return `${formatter(range.low)} - ${formatter(range.high)}`;
}
