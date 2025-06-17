interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const steps = [
    { number: 1, label: "Dados Pessoais" },
    { number: 2, label: "Experiência" },
    { number: 3, label: "Habilidades" },
    { number: 4, label: "Revisão" },
  ];

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  step.number <= currentStep
                    ? "bg-incluo-orange text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step.number}
              </div>
              <span
                className={`ml-3 font-medium hidden sm:block transition-all ${
                  step.number <= currentStep ? "text-incluo-navy" : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 bg-gray-200 mx-4 relative">
                <div
                  className="h-1 bg-incluo-orange transition-all duration-300"
                  style={{
                    width: step.number < currentStep ? "100%" : "0%",
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
