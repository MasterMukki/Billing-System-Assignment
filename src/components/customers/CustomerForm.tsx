import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"
import { customerStorage } from "@/lib/storage"
import type { PersonalInfoFormData, AddressInfoFormData } from "@/lib/validations"
import { customerSchema } from "@/lib/validations"
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
    console.log("[CustomerForm] Personal form submitted:", data)
    setPersonalData(data)
    setCurrentStep(2)
  }

  const handleAddressSubmit = async (data: AddressInfoFormData) => {
    console.log("[CustomerForm] Address form submitted:", data)
    setAddressData(data)
    setCurrentStep(3)
  }

  const handleFinalSubmit = async () => {
    if (!personalData || !addressData) {
      console.log("[CustomerForm] Missing personalData or addressData")
      toast.error("Please complete all form steps")
      return
    }

    setIsSubmitting(true)
    try {
      const customerData = {
        personalInfo: personalData,
        addressInfo: addressData,
      }

      // Validate with customerSchema
      const validatedData = await customerSchema.parseAsync(customerData)
      console.log("[CustomerForm] Validated customer data:", validatedData)

      const customer = await customerStorage.create(validatedData as any)
      console.log("[CustomerForm] Customer created successfully:", customer)
      toast.success("Customer created successfully!")
      navigate("/customers")
    } catch (error) {
      console.error("[CustomerForm] Failed to create customer:", error)
      if (error instanceof z.ZodError) {
        //@ts-ignore
        error.errors.forEach((err) => {
          if (err.path.join(".") === "personalInfo.email") {
            toast.error(err.message)
            setCurrentStep(1) // Go back to personal info step for email errors
          } else {
            toast.error(`Validation error: ${err.message}`)
          }
        })
      } else {
        toast.error("Failed to create customer. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <ProgressSteps currentStep={currentStep} />
      
      {currentStep === 1 && (
        <PersonalInfoForm onSubmit={handlePersonalSubmit} initialData={personalData as any} />
      )}
      
      {currentStep === 2 && (
        <AddressInfoForm 
          onSubmit={handleAddressSubmit} 
          onPrevious={() => setCurrentStep(1)}
          initialData={addressData as any}
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