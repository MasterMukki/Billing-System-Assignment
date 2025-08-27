import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronRight } from "lucide-react"
import { personalInfoSchema } from "@/lib/validations"
import type { PersonalInfoFormData } from "@/lib/validations"

interface PersonalInfoFormProps {
  onSubmit: (data: PersonalInfoFormData) => void
}

export function PersonalInfoForm({ onSubmit }: PersonalInfoFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Enter your basic contact information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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