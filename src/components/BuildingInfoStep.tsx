import React from 'react';
import type { BuildingInfo, BuildingType } from '../types';
import { buildingTypeLabels } from '../data/ll97Data';

interface BuildingInfoStepProps {
  data: Partial<BuildingInfo>;
  onChange: (data: Partial<BuildingInfo>) => void;
  onNext: () => void;
}

const BuildingInfoStep: React.FC<BuildingInfoStepProps> = ({ data, onChange, onNext }) => {
  const handleInputChange = (field: keyof BuildingInfo, value: string | number) => {
    onChange({ ...data, [field]: value });
  };

  const isValid = () => {
    return (
      data.address &&
      data.squareFootage &&
      data.squareFootage > 0 &&
      data.buildingType &&
      data.yearBuilt &&
      data.yearBuilt > 1800 &&
      data.yearBuilt <= new Date().getFullYear()
    );
  };

  return (
    <div className="card fade-in">
      <h2 className="text-2xl font-headline mb-2">Building Information</h2>
      <p className="text-spring-gray mb-6">
        Tell us about your building to help us assess LL97 compliance and retrofit opportunities.
      </p>

      <div className="space-y-6">
        {/* Address */}
        <div>
          <label htmlFor="address" className="form-label">
            Building Address
          </label>
          <input
            type="text"
            id="address"
            className="form-input"
            placeholder="123 Main Street, New York, NY 10001"
            value={data.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
          />
        </div>

        {/* Square Footage and Year Built - Side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="squareFootage" className="form-label">
              Gross Square Footage
            </label>
            <input
              type="number"
              id="squareFootage"
              className="form-input"
              placeholder="50,000"
              min="25000"
              value={data.squareFootage || ''}
              onChange={(e) => handleInputChange('squareFootage', parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-spring-gray-light mt-1">
              LL97 applies to buildings over 25,000 sq ft
            </p>
          </div>

          <div>
            <label htmlFor="yearBuilt" className="form-label">
              Year Built
            </label>
            <input
              type="number"
              id="yearBuilt"
              className="form-input"
              placeholder="1960"
              min="1800"
              max={new Date().getFullYear()}
              value={data.yearBuilt || ''}
              onChange={(e) => handleInputChange('yearBuilt', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Building Type */}
        <div>
          <label htmlFor="buildingType" className="form-label">
            Building Type
          </label>
          <select
            id="buildingType"
            className="form-select"
            value={data.buildingType || ''}
            onChange={(e) => handleInputChange('buildingType', e.target.value as BuildingType)}
          >
            <option value="">Select building type...</option>
            {Object.entries(buildingTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <p className="text-xs text-spring-gray-light mt-1">
            Different building types have different LL97 emissions limits
          </p>
        </div>

        {/* Optional: Number of Units (for residential) */}
        {(data.buildingType === 'multifamily' || data.buildingType === 'hotel') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="numberOfUnits" className="form-label">
                Number of Units <span className="text-spring-gray-light">(optional)</span>
              </label>
              <input
                type="number"
                id="numberOfUnits"
                className="form-input"
                placeholder="100"
                min="1"
                value={data.numberOfUnits || ''}
                onChange={(e) => handleInputChange('numberOfUnits', parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <label htmlFor="numberOfFloors" className="form-label">
                Number of Floors <span className="text-spring-gray-light">(optional)</span>
              </label>
              <input
                type="number"
                id="numberOfFloors"
                className="form-input"
                placeholder="10"
                min="1"
                value={data.numberOfFloors || ''}
                onChange={(e) => handleInputChange('numberOfFloors', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        )}

        {/* Info box about LL97 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="text-blue-500 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 text-sm">About NYC Local Law 97</h4>
              <p className="text-blue-700 text-sm mt-1">
                LL97 requires buildings over 25,000 sq ft to meet carbon emission limits starting in 2024,
                with stricter limits in 2030. Buildings exceeding limits face penalties of $268 per metric
                ton of CO₂ over the threshold.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-end">
        <button
          className="btn-primary"
          onClick={onNext}
          disabled={!isValid()}
        >
          Continue to Energy Usage
          <svg className="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default BuildingInfoStep;
