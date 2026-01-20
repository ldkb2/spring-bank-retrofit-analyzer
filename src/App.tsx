import { useState, useCallback } from 'react';
import './index.css';

import Header from './components/Header';
import ProgressIndicator from './components/ProgressIndicator';
import BuildingInfoStep from './components/BuildingInfoStep';
import EnergyUsageStep from './components/EnergyUsageStep';
import RetrofitSelectionStep from './components/RetrofitSelectionStep';
import ResultsStep from './components/ResultsStep';

import type { WizardState, BuildingInfo, EnergyUsage } from './types';
import { runFullAnalysis } from './utils/calculations';
import { generatePDFReport } from './utils/pdfGenerator';

const steps = [
  { number: 1, title: 'Building Info', description: 'Basic details' },
  { number: 2, title: 'Energy Usage', description: 'Annual consumption' },
  { number: 3, title: 'Retrofits', description: 'Select measures' },
  { number: 4, title: 'Results', description: 'Analysis & loans' },
];

const initialState: WizardState = {
  currentStep: 1,
  buildingInfo: {},
  energyUsage: {
    electricityKwh: 0,
    naturalGasTherms: 0,
    fuelOilGallons: 0,
    steamMLbs: 0,
    districtChilledWaterTonHrs: 0,
  },
  selectedRetrofits: [],
  results: null,
};

function App() {
  const [state, setState] = useState<WizardState>(initialState);

  const updateBuildingInfo = useCallback((data: Partial<BuildingInfo>) => {
    setState((prev) => ({
      ...prev,
      buildingInfo: data,
    }));
  }, []);

  const updateEnergyUsage = useCallback((data: Partial<EnergyUsage>) => {
    setState((prev) => ({
      ...prev,
      energyUsage: data,
    }));
  }, []);

  const updateSelectedRetrofits = useCallback((retrofitIds: string[]) => {
    setState((prev) => ({
      ...prev,
      selectedRetrofits: retrofitIds,
    }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setState((prev) => ({
      ...prev,
      currentStep: step,
    }));
    // Scroll to top on step change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleAnalyze = useCallback(() => {
    // Validate all data is present
    const buildingInfo = state.buildingInfo as BuildingInfo;
    const energyUsage: EnergyUsage = {
      electricityKwh: state.energyUsage.electricityKwh || 0,
      naturalGasTherms: state.energyUsage.naturalGasTherms || 0,
      fuelOilGallons: state.energyUsage.fuelOilGallons || 0,
      steamMLbs: state.energyUsage.steamMLbs || 0,
      districtChilledWaterTonHrs: state.energyUsage.districtChilledWaterTonHrs || 0,
    };

    // Run the analysis
    const results = runFullAnalysis(buildingInfo, energyUsage, state.selectedRetrofits);

    setState((prev) => ({
      ...prev,
      results,
      currentStep: 4,
    }));

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state.buildingInfo, state.energyUsage, state.selectedRetrofits]);

  const handleDownloadPDF = useCallback(() => {
    if (state.results) {
      generatePDFReport(state.results);
    }
  }, [state.results]);

  const handleStartOver = useCallback(() => {
    setState(initialState);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <ProgressIndicator steps={steps} currentStep={state.currentStep} />

        {/* Step Content */}
        <div className="mt-8">
          {state.currentStep === 1 && (
            <BuildingInfoStep
              data={state.buildingInfo}
              onChange={updateBuildingInfo}
              onNext={() => goToStep(2)}
            />
          )}

          {state.currentStep === 2 && (
            <EnergyUsageStep
              data={state.energyUsage}
              buildingInfo={state.buildingInfo}
              onChange={updateEnergyUsage}
              onNext={() => goToStep(3)}
              onBack={() => goToStep(1)}
            />
          )}

          {state.currentStep === 3 && (
            <RetrofitSelectionStep
              selectedRetrofits={state.selectedRetrofits}
              buildingInfo={state.buildingInfo}
              onChange={updateSelectedRetrofits}
              onNext={handleAnalyze}
              onBack={() => goToStep(2)}
            />
          )}

          {state.currentStep === 4 && state.results && (
            <ResultsStep
              results={state.results}
              onBack={() => goToStep(3)}
              onDownloadPDF={handleDownloadPDF}
              onStartOver={handleStartOver}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <img
                src="/spring-bank-logo.png"
                alt="Spring Bank"
                className="h-6 w-auto"
              />
            </div>

            <div className="text-sm text-spring-gray-light text-center md:text-right">
              <p>Building Retrofit Loan Analyzer</p>
              <p className="mt-1">
                © {new Date().getFullYear()} Spring Bank. For illustrative purposes only.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 text-xs text-spring-gray-light text-center">
            <p>
              Data sources: NYC Local Law 97, EPA emission factors, industry cost estimates.
              This tool provides estimates only. Consult with qualified professionals for
              project-specific assessments.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
