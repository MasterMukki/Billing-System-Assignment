import { User, MapPin, CheckCircle } from "lucide-react"

interface ProgressStepsProps {
  currentStep: number
}

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
  const steps = [
    { number: 1, title: "Personal Info", icon: User },
    { number: 2, title: "Address Info", icon: MapPin },
    { number: 3, title: "Review", icon: CheckCircle },
  ]

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const Icon = step.icon
        const isActive = currentStep === step.number
        const isCompleted = currentStep > step.number

        return (
          <div key={step.number} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : isCompleted
                  ? "border-green-500 bg-green-500 text-white"
                  : "border-muted-foreground text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                Step {step.number}
              </p>
              <p className={`text-xs ${isActive ? "text-primary" : "text-muted-foreground"}`}>{step.title}</p>
            </div>
            {index < steps.length - 1 && <div className="flex-1 h-px bg-muted-foreground/20 mx-4" />}
          </div>
        )
      })}
    </div>
  )
}