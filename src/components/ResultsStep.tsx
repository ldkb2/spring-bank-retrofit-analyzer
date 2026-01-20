import React from 'react';
import type { AnalysisResults } from '../types';
import { buildingTypeLabels } from '../data/ll97Data';
import { formatCurrency, formatNumber, formatRange } from '../utils/calculations';
import { retrofitOptions } from '../data/retrofitOptions';

interface ResultsStepProps {
  results: AnalysisResults;
  onBack: () => void;
  onDownloadPDF: () => void;
  onStartOver: () => void;
}

const ResultsStep: React.FC<ResultsStepProps> = ({
  results,
  onBack,
  onDownloadPDF,
  onStartOver,
}) => {
  const {
    buildingInfo,
    complianceStatus,
    postRetrofitCompliance,
    financialSummary,
    retrofitAnalysis,
    loanRecommendations,
  } = results;

  const getComplianceColor = (compliant: boolean) =>
    compliant ? 'text-green-600' : 'text-red-600';

  const getComplianceBg = (compliant: boolean) =>
    compliant ? 'bg-green-100' : 'bg-red-100';

  return (
    <div className="fade-in space-y-6">
      {/* Header with summary */}
      <div className="savings-highlight">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-headline mb-2">Your Retrofit Analysis</h2>
            <p className="opacity-90">{buildingInfo.address}</p>
            <p className="opacity-75 text-sm">
              {formatNumber(buildingInfo.squareFootage)} sq ft •{' '}
              {buildingTypeLabels[buildingInfo.buildingType]} • Built {buildingInfo.yearBuilt}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              onClick={onDownloadPDF}
            >
              <svg
                className="w-4 h-4 inline mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download Report
            </button>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-3xl font-headline font-bold">
              {formatRange(financialSummary.totalRetrofitCost, (n) =>
                n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}K`
              )}
            </div>
            <div className="text-sm opacity-75 mt-1">Total Investment</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-3xl font-headline font-bold">
              {formatRange(financialSummary.annualEnergyCostSavings, (n) =>
                `$${(n / 1000).toFixed(0)}K`
              )}
            </div>
            <div className="text-sm opacity-75 mt-1">Annual Energy Savings</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-3xl font-headline font-bold">
              {formatRange(financialSummary.simplePayback, (n) => `${n.toFixed(1)}`)} yrs
            </div>
            <div className="text-sm opacity-75 mt-1">Simple Payback</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-3xl font-headline font-bold">
              {formatCurrency(financialSummary.annualLL97PenaltyAvoidance.year2030)}
            </div>
            <div className="text-sm opacity-75 mt-1">LL97 Penalty Avoided (2030)</div>
          </div>
        </div>
      </div>

      {/* LL97 Compliance Comparison */}
      <div className="card">
        <h3 className="text-xl font-headline mb-4">LL97 Compliance Status</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-spring-gray">
                  Compliance Period
                </th>
                <th className="text-center py-3 px-4 font-semibold text-spring-gray">
                  Current Status
                </th>
                <th className="text-center py-3 px-4 font-semibold text-spring-gray">
                  After Retrofits
                </th>
                <th className="text-right py-3 px-4 font-semibold text-spring-gray">
                  Penalty Savings
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4">
                  <div className="font-semibold">2024-2029</div>
                  <div className="text-sm text-spring-gray-light">
                    Limit: {(complianceStatus.threshold2024 * 1000).toFixed(2)} kgCO₂e/sf
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getComplianceBg(
                      complianceStatus.compliant2024
                    )} ${getComplianceColor(complianceStatus.compliant2024)}`}
                  >
                    {complianceStatus.compliant2024 ? 'Compliant' : 'Non-Compliant'}
                  </span>
                  {!complianceStatus.compliant2024 && (
                    <div className="text-sm text-red-600 mt-1">
                      Penalty: {formatCurrency(complianceStatus.annualPenalty2024)}/yr
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getComplianceBg(
                      postRetrofitCompliance.compliant2024
                    )} ${getComplianceColor(postRetrofitCompliance.compliant2024)}`}
                  >
                    {postRetrofitCompliance.compliant2024 ? 'Compliant' : 'Non-Compliant'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-semibold text-green-600">
                  {formatCurrency(
                    complianceStatus.annualPenalty2024 - postRetrofitCompliance.annualPenalty2024
                  )}
                  /yr
                </td>
              </tr>
              <tr className="border-b border-gray-100 bg-amber-50">
                <td className="py-3 px-4">
                  <div className="font-semibold">2030-2034</div>
                  <div className="text-sm text-spring-gray-light">
                    Limit: {(complianceStatus.threshold2030 * 1000).toFixed(2)} kgCO₂e/sf
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getComplianceBg(
                      complianceStatus.compliant2030
                    )} ${getComplianceColor(complianceStatus.compliant2030)}`}
                  >
                    {complianceStatus.compliant2030 ? 'Compliant' : 'Non-Compliant'}
                  </span>
                  {!complianceStatus.compliant2030 && (
                    <div className="text-sm text-red-600 mt-1">
                      Penalty: {formatCurrency(complianceStatus.annualPenalty2030)}/yr
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getComplianceBg(
                      postRetrofitCompliance.compliant2030
                    )} ${getComplianceColor(postRetrofitCompliance.compliant2030)}`}
                  >
                    {postRetrofitCompliance.compliant2030 ? 'Compliant' : 'Non-Compliant'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-semibold text-green-600">
                  {formatCurrency(
                    complianceStatus.annualPenalty2030 - postRetrofitCompliance.annualPenalty2030
                  )}
                  /yr
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4">
                  <div className="font-semibold">2035-2039</div>
                  <div className="text-sm text-spring-gray-light">
                    Limit: {(complianceStatus.threshold2035 * 1000).toFixed(2)} kgCO₂e/sf
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getComplianceBg(
                      complianceStatus.compliant2035
                    )} ${getComplianceColor(complianceStatus.compliant2035)}`}
                  >
                    {complianceStatus.compliant2035 ? 'Compliant' : 'Non-Compliant'}
                  </span>
                  {!complianceStatus.compliant2035 && (
                    <div className="text-sm text-red-600 mt-1">
                      Penalty: {formatCurrency(complianceStatus.annualPenalty2035)}/yr
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getComplianceBg(
                      postRetrofitCompliance.compliant2035
                    )} ${getComplianceColor(postRetrofitCompliance.compliant2035)}`}
                  >
                    {postRetrofitCompliance.compliant2035 ? 'Compliant' : 'Non-Compliant'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-semibold text-green-600">
                  {formatCurrency(
                    complianceStatus.annualPenalty2035 - postRetrofitCompliance.annualPenalty2035
                  )}
                  /yr
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Emissions comparison */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-spring-gray">Current Emissions</div>
              <div className="text-lg font-semibold">
                {formatNumber(complianceStatus.currentEmissions, 1)} tCO₂e/year
              </div>
              <div className="text-sm text-spring-gray-light">
                {(complianceStatus.emissionsIntensity * 1000).toFixed(2)} kgCO₂e/sf
              </div>
            </div>
            <div className="text-spring-green">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>
            <div className="text-right">
              <div className="text-sm text-spring-gray">After Retrofits</div>
              <div className="text-lg font-semibold text-spring-green">
                {formatNumber(postRetrofitCompliance.currentEmissions, 1)} tCO₂e/year
              </div>
              <div className="text-sm text-green-600">
                {(
                  ((complianceStatus.currentEmissions - postRetrofitCompliance.currentEmissions) /
                    complianceStatus.currentEmissions) *
                  100
                ).toFixed(0)}
                % reduction
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Retrofits Breakdown */}
      <div className="card">
        <h3 className="text-xl font-headline mb-4">Selected Retrofit Measures</h3>

        <div className="space-y-4">
          {retrofitAnalysis.map((analysis) => {
            const retrofit = retrofitOptions.find((r) => r.id === analysis.retrofitId);
            return (
              <div
                key={analysis.retrofitId}
                className="border border-gray-200 rounded-lg p-4 hover:border-spring-green/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{retrofit?.icon}</span>
                    <div>
                      <h4 className="font-semibold text-spring-gray-dark">{analysis.retrofitName}</h4>
                      <p className="text-sm text-spring-gray">{retrofit?.description}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-spring-gray-light">Estimated Cost</div>
                    <div className="font-semibold">
                      {formatRange(analysis.estimatedCost, formatCurrency)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-spring-gray-light">Annual Savings</div>
                    <div className="font-semibold text-green-600">
                      {formatRange(analysis.annualEnergySavings, formatCurrency)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-spring-gray-light">Payback Period</div>
                    <div className="font-semibold">
                      {formatRange(analysis.paybackPeriod, (n) => n.toFixed(1))} years
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-spring-gray-light">Emissions Reduction</div>
                    <div className="font-semibold text-spring-green">
                      {formatRange(analysis.annualEmissionsReduction, (n) => formatNumber(n, 1))}{' '}
                      tCO₂e
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="card">
        <h3 className="text-xl font-headline mb-4">Financial Summary</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-spring-gray-dark mb-3">Investment & Returns</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-spring-gray">Total Project Cost</span>
                <span className="font-semibold">
                  {formatRange(financialSummary.totalRetrofitCost, formatCurrency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-spring-gray">Annual Energy Savings</span>
                <span className="font-semibold text-green-600">
                  {formatRange(financialSummary.annualEnergyCostSavings, formatCurrency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-spring-gray">LL97 Penalty Avoidance (2030)</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(financialSummary.annualLL97PenaltyAvoidance.year2030)}/yr
                </span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-spring-gray font-semibold">Simple Payback</span>
                <span className="font-semibold">
                  {formatRange(financialSummary.simplePayback, (n) => n.toFixed(1))} years
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-spring-gray-dark mb-3">Long-Term Savings</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-spring-gray">10-Year Net Savings</span>
                <span
                  className={`font-semibold ${
                    financialSummary.tenYearNetSavings.low > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatRange(financialSummary.tenYearNetSavings, formatCurrency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-spring-gray">20-Year Net Savings</span>
                <span
                  className={`font-semibold ${
                    financialSummary.twentyYearNetSavings.low > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatRange(financialSummary.twentyYearNetSavings, formatCurrency)}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
              <strong>Note:</strong> These projections are estimates based on current energy costs
              and do not account for utility rate increases, which typically average 2-3% annually.
            </div>
          </div>
        </div>
      </div>

      {/* Loan Recommendations */}
      <div className="card">
        <h3 className="text-xl font-headline mb-4">Financing Recommendations</h3>
        <p className="text-spring-gray mb-6">
          Based on your project characteristics, here are financing options to consider:
        </p>

        <div className="space-y-4">
          {loanRecommendations.map((loan, index) => (
            <div
              key={index}
              className={`border-2 rounded-lg p-5 ${
                loan.suitability === 'excellent'
                  ? 'border-spring-green bg-spring-green/5'
                  : loan.suitability === 'good'
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-lg text-spring-gray-dark">{loan.loanType}</h4>
                    {loan.suitability === 'excellent' && (
                      <span className="bg-spring-green text-white text-xs px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-spring-gray mt-1">{loan.description}</p>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-sm text-spring-gray-light">Typical Terms</div>
                <div className="text-sm font-medium">{loan.typicalTerms}</div>
              </div>

              <div className="mt-3">
                <div className="text-sm text-spring-gray-light mb-1">Why this might work for you:</div>
                <ul className="text-sm space-y-1">
                  {loan.reasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <svg
                        className="w-4 h-4 text-spring-green mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="card bg-spring-green text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-headline mb-1">Ready to Get Started?</h3>
            <p className="opacity-90">
              Contact Spring Bank to discuss financing options for your building retrofit project.
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="https://www.spring.bank"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-spring-green px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button className="btn-secondary" onClick={onBack}>
          <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Modify Selections
        </button>
        <button className="btn-secondary" onClick={onStartOver}>
          Start New Analysis
        </button>
      </div>

      {/* Disclaimer */}
      <div className="text-xs text-spring-gray-light text-center mt-8 pb-4">
        <p>
          <strong>Disclaimer:</strong> This analysis provides estimates for informational purposes
          only. Actual costs, savings, and compliance outcomes may vary based on building-specific
          conditions, contractor pricing, utility rates, and other factors. Consult with qualified
          professionals for detailed assessments. Spring Bank does not guarantee any specific
          outcomes.
        </p>
      </div>
    </div>
  );
};

export default ResultsStep;
