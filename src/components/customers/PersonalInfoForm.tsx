import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { personalInfoSchema } from "@/lib/validations"
import type { PersonalInfoFormData } from "@/lib/validations"
import { customerStorage } from "@/lib/storage"
import { useEffect } from "react"

interface PersonalInfoFormProps {
  onSubmit: (data: PersonalInfoFormData) => void
  initialData?: PersonalInfoFormData
}

export function PersonalInfoForm({ onSubmit, initialData }: PersonalInfoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    watch,
    reset,
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    mode: "onChange",
    defaultValues: initialData || {
      name: "",
      email: "",
      phone: "",
    },
  })

  // Watch email field to clear errors on change
  const email = watch("email")

  useEffect(() => {
    // Clear email error when the email input changes
    if (errors.email?.type === "manual") {
      clearErrors("email")
    }
  }, [email, errors.email, clearErrors])

  // Update form with initialData when it changes (e.g., navigating back)
  useEffect(() => {
    if (initialData) {
      reset(initialData)
    }
  }, [initialData, reset])

  const handleFormSubmit = async (data: PersonalInfoFormData) => {
    try {
      const exists = await customerStorage.emailExists(data.email)
      console.log("[PersonalInfoForm] Email exists:", exists)
      if (exists) {
        setError("email", {
          type: "manual",
          message: "A customer with this email already exists",
        })
        toast.error("A customer with this email already exists")
        return
      }
      clearErrors("email")
      onSubmit(data)
    } catch (error) {
      console.error("[PersonalInfoForm] Error checking email existence:", error)
      setError("email", {
        type: "manual",
        message: "An error occurred while checking the email",
      })
      toast.error("An error occurred while checking the email")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Enter your basic contact information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input id="name" {...register("name")} placeholder="Enter your full name" />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" {...register("phone")} placeholder="Enter your phone number" />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="gap-2">
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}