import React, { useState } from 'react';
import type { EnergyUsage, BuildingInfo } from '../types';
import { typicalEUI } from '../data/ll97Data';

interface EnergyUsageStepProps {
  data: Partial<EnergyUsage>;
  buildingInfo: Partial<BuildingInfo>;
  onChange: (data: Partial<EnergyUsage>) => void;
  onNext: () => void;
  onBack: () => void;
}

const EnergyUsageStep: React.FC<EnergyUsageStepProps> = ({
  data,
  buildingInfo,
  onChange,
  onNext,
  onBack,
}) => {
  const [useEstimates, setUseEstimates] = useState(false);

  const handleInputChange = (field: keyof EnergyUsage, value: number) => {
    onChange({ ...data, [field]: value });
  };

  const applyEstimates = () => {
    if (!buildingInfo.buildingType || !buildingInfo.squareFootage) return;

    const euiData = typicalEUI[buildingInfo.buildingType];
    const sqft = buildingInfo.squareFootage;

    // Convert EUI (kBtu/sqft) to estimated energy usage
    // Assume typical fuel mix: 60% electricity, 30% natural gas, 10% other
    const totalKBtu = euiData.median * sqft;

    // Conversions: 1 kWh = 3.412 kBtu, 1 therm = 100 kBtu
    const electricityKBtu = totalKBtu * 0.6;
    const gasKBtu = totalKBtu * 0.3;

    onChange({
      electricityKwh: Math.round(electricityKBtu / 3.412),
      naturalGasTherms: Math.round(gasKBtu / 100),
      fuelOilGallons: 0,
      steamMLbs: 0,
      districtChilledWaterTonHrs: 0,
    });

    setUseEstimates(true);
  };

  const isValid = () => {
    // At least electricity or gas should be provided
    return (
      (data.electricityKwh && data.electricityKwh > 0) ||
      (data.naturalGasTherms && data.naturalGasTherms > 0) ||
      (data.fuelOilGallons && data.fuelOilGallons > 0) ||
      (data.steamMLbs && data.steamMLbs > 0)
    );
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="card fade-in">
      <h2 className="text-2xl font-headline mb-2">Annual Energy Usage</h2>
      <p className="text-spring-gray mb-6">
        Enter your building's annual energy consumption. This data is typically available from
        your utility bills or building benchmarking reports.
      </p>

      {/* Estimate option */}
      <div className="bg-spring-green/5 border border-spring-green/20 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="text-spring-green mt-0.5">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-spring-gray-dark text-sm">
              Don't have exact numbers?
            </h4>
            <p className="text-spring-gray text-sm mt-1">
              We can estimate based on typical energy usage for your building type.
              {buildingInfo.buildingType && buildingInfo.squareFootage && (
                <span className="block mt-1">
                  Typical EUI for {buildingInfo.buildingType} buildings:{' '}
                  <strong>{typicalEUI[buildingInfo.buildingType].median} kBtu/sqft/year</strong>
                </span>
              )}
            </p>
            <button
              type="button"
              className="btn-secondary mt-3 text-sm py-2 px-4"
              onClick={applyEstimates}
            >
              Use Estimated Values
            </button>
          </div>
        </div>
      </div>

      {useEstimates && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
          <p className="text-amber-800 text-sm">
            <strong>Note:</strong> Estimated values have been applied. For more accurate results,
            replace these with actual values from your utility bills.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Electricity */}
        <div>
          <label htmlFor="electricityKwh" className="form-label">
            Electricity (kWh per year)
          </label>
          <input
            type="number"
            id="electricityKwh"
            className="form-input"
            placeholder="500,000"
            min="0"
            value={data.electricityKwh || ''}
            onChange={(e) => handleInputChange('electricityKwh', parseInt(e.target.value) || 0)}
          />
          {data.electricityKwh ? (
            <p className="text-xs text-spring-gray-light mt-1">
              ≈ ${formatNumber(Math.round(data.electricityKwh * 0.22))}/year at $0.22/kWh
            </p>
          ) : null}
        </div>

        {/* Natural Gas */}
        <div>
          <label htmlFor="naturalGasTherms" className="form-label">
            Natural Gas (therms per year)
          </label>
          <input
            type="number"
            id="naturalGasTherms"
            className="form-input"
            placeholder="10,000"
            min="0"
            value={data.naturalGasTherms || ''}
            onChange={(e) => handleInputChange('naturalGasTherms', parseInt(e.target.value) || 0)}
          />
          {data.naturalGasTherms ? (
            <p className="text-xs text-spring-gray-light mt-1">
              ≈ ${formatNumber(Math.round(data.naturalGasTherms * 1.5))}/year at $1.50/therm
            </p>
          ) : null}
        </div>

        {/* Fuel Oil */}
        <div>
          <label htmlFor="fuelOilGallons" className="form-label">
            Fuel Oil (gallons per year){' '}
            <span className="text-spring-gray-light font-normal">- if applicable</span>
          </label>
          <input
            type="number"
            id="fuelOilGallons"
            className="form-input"
            placeholder="0"
            min="0"
            value={data.fuelOilGallons || ''}
            onChange={(e) => handleInputChange('fuelOilGallons', parseInt(e.target.value) || 0)}
          />
        </div>

        {/* District Steam */}
        <div>
          <label htmlFor="steamMLbs" className="form-label">
            District Steam (MLbs per year){' '}
            <span className="text-spring-gray-light font-normal">- if applicable</span>
          </label>
          <input
            type="number"
            id="steamMLbs"
            className="form-input"
            placeholder="0"
            min="0"
            value={data.steamMLbs || ''}
            onChange={(e) => handleInputChange('steamMLbs', parseInt(e.target.value) || 0)}
          />
          <p className="text-xs text-spring-gray-light mt-1">
            Common in Manhattan commercial buildings
          </p>
        </div>

        {/* District Chilled Water */}
        <div>
          <label htmlFor="districtChilledWaterTonHrs" className="form-label">
            District Chilled Water (ton-hours per year){' '}
            <span className="text-spring-gray-light font-normal">- if applicable</span>
          </label>
          <input
            type="number"
            id="districtChilledWaterTonHrs"
            className="form-input"
            placeholder="0"
            min="0"
            value={data.districtChilledWaterTonHrs || ''}
            onChange={(e) =>
              handleInputChange('districtChilledWaterTonHrs', parseInt(e.target.value) || 0)
            }
          />
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
        <button className="btn-primary" onClick={onNext} disabled={!isValid()}>
          Continue to Retrofit Selection
          <svg className="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default EnergyUsageStep;
