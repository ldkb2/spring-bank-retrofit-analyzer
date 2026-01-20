import React, { useState } from 'react';
import type { BuildingInfo } from '../types';
import { retrofitOptions, retrofitCategories } from '../data/retrofitOptions';

interface RetrofitSelectionStepProps {
  selectedRetrofits: string[];
  buildingInfo: Partial<BuildingInfo>;
  onChange: (retrofitIds: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const RetrofitSelectionStep: React.FC<RetrofitSelectionStepProps> = ({
  selectedRetrofits,
  buildingInfo,
  onChange,
  onNext,
  onBack,
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('envelope');

  const toggleRetrofit = (retrofitId: string) => {
    if (selectedRetrofits.includes(retrofitId)) {
      onChange(selectedRetrofits.filter((id) => id !== retrofitId));
    } else {
      onChange([...selectedRetrofits, retrofitId]);
    }
  };

  const getApplicableRetrofits = (categoryId: string) => {
    return retrofitOptions.filter((r) => {
      if (r.category !== categoryId) return false;
      if (r.applicableBuildingTypes === 'all') return true;
      if (!buildingInfo.buildingType) return true;
      return r.applicableBuildingTypes.includes(buildingInfo.buildingType);
    });
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  const calculateEstimatedCost = (retrofitId: string) => {
    const retrofit = retrofitOptions.find((r) => r.id === retrofitId);
    if (!retrofit || !buildingInfo.squareFootage) return null;

    const low = retrofit.estimatedCostPerSqFt.low * buildingInfo.squareFootage;
    const high = retrofit.estimatedCostPerSqFt.high * buildingInfo.squareFootage;

    return { low, high };
  };

  const totalSelectedCount = selectedRetrofits.length;
  const totalEstimatedCost = selectedRetrofits.reduce(
    (acc, id) => {
      const cost = calculateEstimatedCost(id);
      if (cost) {
        return {
          low: acc.low + cost.low,
          high: acc.high + cost.high,
        };
      }
      return acc;
    },
    { low: 0, high: 0 }
  );

  return (
    <div className="card fade-in">
      <h2 className="text-2xl font-headline mb-2">Select Retrofit Measures</h2>
      <p className="text-spring-gray mb-6">
        Choose the energy efficiency improvements you're considering for your building.
        We'll analyze the costs, savings, and LL97 compliance impact.
      </p>

      {/* Selection Summary */}
      {totalSelectedCount > 0 && (
        <div className="bg-spring-green/10 border border-spring-green/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-spring-green">
                {totalSelectedCount} measure{totalSelectedCount !== 1 ? 's' : ''} selected
              </span>
              <span className="text-spring-gray ml-2">
                Estimated cost: {formatCurrency(totalEstimatedCost.low)} -{' '}
                {formatCurrency(totalEstimatedCost.high)}
              </span>
            </div>
            <button
              type="button"
              className="text-sm text-spring-gray hover:text-spring-gray-dark"
              onClick={() => onChange([])}
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Retrofit Categories */}
      <div className="space-y-4">
        {retrofitCategories.map((category) => {
          const applicableRetrofits = getApplicableRetrofits(category.id);
          if (applicableRetrofits.length === 0) return null;

          const isExpanded = expandedCategory === category.id;
          const selectedInCategory = applicableRetrofits.filter((r) =>
            selectedRetrofits.includes(r.id)
          ).length;

          return (
            <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Category Header */}
              <button
                type="button"
                className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-spring-gray-dark">{category.name}</span>
                  <span className="text-sm text-spring-gray-light">{category.description}</span>
                </div>
                <div className="flex items-center gap-3">
                  {selectedInCategory > 0 && (
                    <span className="bg-spring-green text-white text-xs px-2 py-1 rounded-full">
                      {selectedInCategory} selected
                    </span>
                  )}
                  <svg
                    className={`w-5 h-5 text-spring-gray transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {/* Category Content */}
              {isExpanded && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {applicableRetrofits.map((retrofit) => {
                    const isSelected = selectedRetrofits.includes(retrofit.id);
                    const estimatedCost = calculateEstimatedCost(retrofit.id);

                    return (
                      <div
                        key={retrofit.id}
                        className={`retrofit-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleRetrofit(retrofit.id)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isSelected
                                ? 'bg-spring-green border-spring-green'
                                : 'border-gray-300'
                            }`}
                          >
                            {isSelected && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{retrofit.icon}</span>
                              <h4 className="font-semibold text-spring-gray-dark">
                                {retrofit.name}
                              </h4>
                            </div>
                            <p className="text-sm text-spring-gray mt-1">{retrofit.description}</p>

                            {/* Metrics */}
                            <div className="mt-3 flex flex-wrap gap-2">
                              {estimatedCost && (
                                <span className="text-xs bg-gray-100 text-spring-gray px-2 py-1 rounded">
                                  {formatCurrency(estimatedCost.low)} -{' '}
                                  {formatCurrency(estimatedCost.high)}
                                </span>
                              )}
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                {retrofit.estimatedEnergySavingsPercent.low}-
                                {retrofit.estimatedEnergySavingsPercent.high}% energy savings
                              </span>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {retrofit.paybackYears.low}-{retrofit.paybackYears.high} yr payback
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick selection presets */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-spring-gray-dark mb-3">Quick Selection Presets</h4>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="text-sm px-3 py-1.5 border border-gray-300 rounded-full hover:border-spring-green hover:text-spring-green transition-colors"
            onClick={() =>
              onChange(['led-retrofit', 'smart-thermostats', 'air-sealing', 'low-flow-fixtures'])
            }
          >
            Low-Cost Quick Wins
          </button>
          <button
            type="button"
            className="text-sm px-3 py-1.5 border border-gray-300 rounded-full hover:border-spring-green hover:text-spring-green transition-colors"
            onClick={() =>
              onChange([
                'heat-pump-space',
                'heat-pump-water',
                'led-retrofit',
                'insulation',
                'window-replacement',
              ])
            }
          >
            Deep Decarbonization
          </button>
          <button
            type="button"
            className="text-sm px-3 py-1.5 border border-gray-300 rounded-full hover:border-spring-green hover:text-spring-green transition-colors"
            onClick={() =>
              onChange(['hvac-upgrade', 'bms-upgrade', 'led-retrofit', 'lighting-controls'])
            }
          >
            HVAC & Controls Focus
          </button>
          <button
            type="button"
            className="text-sm px-3 py-1.5 border border-gray-300 rounded-full hover:border-spring-green hover:text-spring-green transition-colors"
            onClick={() => onChange(['rooftop-solar', 'battery-storage', 'heat-pump-space'])}
          >
            Renewable Energy
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button className="btn-secondary" onClick={onBack}>
          <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          className="btn-primary"
          onClick={onNext}
          disabled={selectedRetrofits.length === 0}
        >
          Analyze & View Results
          <svg className="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default RetrofitSelectionStep;
