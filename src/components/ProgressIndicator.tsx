import React from 'react';

interface Step {
  number: number;
  title: string;
  description: string;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          const isPending = currentStep < step.number;

          return (
            <React.Fragment key={step.number}>
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={`progress-step ${
                    isCompleted ? 'completed' : isActive ? 'active' : 'pending'
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-semibold ${
                      isActive ? 'text-spring-green' : isPending ? 'text-spring-gray-light' : 'text-spring-gray'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-spring-gray-light hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded ${
                    currentStep > step.number ? 'bg-spring-green' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;
