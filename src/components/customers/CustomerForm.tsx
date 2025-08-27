import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { customerStorage } from "@/lib/storage"
import type { PersonalInfoFormData, AddressInfoFormData } from "@/lib/validations"
import { ProgressSteps } from "./ProgressSteps"
import { PersonalInfoForm } from "./PersonalInfoForm"
import { AddressInfoForm } from "./AddressInfoForm"
import { ReviewInfo } from "./ReviewInfo"

export function CustomerForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [personalData, setPersonalData] = useState<PersonalInfoFormData | null>(null)
  const [addressData, setAddressData] = useState<AddressInfoFormData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handlePersonalSubmit = async (data: PersonalInfoFormData) => {
    console.log("[v0] Personal form submitted:", data)
    setPersonalData(data)
    setCurrentStep(2)
  }

  const handleAddressSubmit = async (data: AddressInfoFormData) => {
    console.log("[v0] Address form submitted:", data)
    setAddressData(data)
    setCurrentStep(3)
  }

  const handleFinalSubmit = async () => {
    if (!personalData || !addressData) return

    setIsSubmitting(true)
    try {
      const customer = await customerStorage.create({
        personalInfo: personalData,
        addressInfo: addressData as any,
      })

      console.log("[v0] Customer created successfully:", customer)
      toast.success("Customer created successfully!")
      navigate('/customers')
    } catch (error) {
      console.error("[v0] Failed to create customer:", error)
      toast.error("Failed to create customer. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <ProgressSteps currentStep={currentStep} />
      
      {currentStep === 1 && (
        <PersonalInfoForm onSubmit={handlePersonalSubmit} />
      )}
      
      {currentStep === 2 && (
        <AddressInfoForm 
          onSubmit={handleAddressSubmit} 
          onPrevious={() => setCurrentStep(1)}
        />
      )}
      
      {currentStep === 3 && personalData && addressData && (
        <ReviewInfo
          personalData={personalData}
          addressData={addressData}
          onPrevious={() => setCurrentStep(2)}
          onSubmit={handleFinalSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}