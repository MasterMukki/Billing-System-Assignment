import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, CheckCircle } from "lucide-react"
import type { PersonalInfoFormData, AddressInfoFormData } from "@/lib/validations"

interface ReviewInfoProps {
  personalData: PersonalInfoFormData
  addressData: AddressInfoFormData
  onPrevious: () => void
  onSubmit: () => void
  isSubmitting: boolean
}

export function ReviewInfo({ personalData, addressData, onPrevious, onSubmit, isSubmitting }: ReviewInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Information</CardTitle>
        <CardDescription>Please review your information before submitting</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Name:</span> {personalData.name}
            </div>
            <div>
              <span className="font-medium">Email:</span> {personalData.email}
            </div>
            {personalData.phone && (
              <div>
                <span className="font-medium">Phone:</span> {personalData.phone}
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Address Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Billing Address</h4>
              <div className="text-sm space-y-1">
                <div>{addressData.billingAddress.street}</div>
                <div>
                  {addressData.billingAddress.city}, {addressData.billingAddress.state}{" "}
                  {addressData.billingAddress.zipCode}
                </div>
                <div>{addressData.billingAddress.country}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Shipping Address</h4>
              <div className="text-sm space-y-1">
                {addressData.sameAsBilling ? (
                  <div className="text-muted-foreground">Same as billing address</div>
                ) : (
                  addressData.shippingAddress && (
                    <>
                      <div>{addressData.shippingAddress.street}</div>
                      <div>
                        {addressData.shippingAddress.city}, {addressData.shippingAddress.state}{" "}
                        {addressData.shippingAddress.zipCode}
                      </div>
                      <div>{addressData.shippingAddress.country}</div>
                    </>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onPrevious} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting} className="gap-2">
            {isSubmitting ? "Creating..." : "Create Customer"}
            <CheckCircle className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}