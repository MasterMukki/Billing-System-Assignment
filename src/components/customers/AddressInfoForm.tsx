import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { addressInfoSchema, countries } from "@/lib/validations"
import type { AddressInfoFormData } from "@/lib/validations"
import { useEffect } from "react"

interface AddressInfoFormProps {
  onSubmit: (data: AddressInfoFormData) => void
  onPrevious: () => void
  initialData?: AddressInfoFormData
}

export function AddressInfoForm({ onSubmit, onPrevious, initialData }: AddressInfoFormProps) {
  const { register, handleSubmit, watch, control, getValues, setValue, clearErrors, trigger, formState: { errors }, reset } = useForm<AddressInfoFormData>({
    resolver: zodResolver(addressInfoSchema as any),
    mode: "onChange",
    defaultValues: initialData || {
      billingAddress: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "India",
      },
      shippingAddress: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "India",
      },
      sameAsBilling: false,
    },
  })

  // Update form with initialData when it changes (e.g., navigating back)
  useEffect(() => {
    if (initialData) {
      reset(initialData)
    }
  }, [initialData, reset])

  const sameAsBilling = watch("sameAsBilling")

  const handleSubmitWithValidation = async (data: AddressInfoFormData) => {
    if (data.sameAsBilling) {
      const billingValid = await trigger("billingAddress")
      if (!billingValid) {
        console.log("[AddressInfoForm] Billing address validation failed")
        return
      }
      onSubmit({
        ...data,
        shippingAddress: data.billingAddress,
      })
    } else {
      const isValid = await trigger()
      if (!isValid) {
        console.log("[AddressInfoForm] Full form validation failed")
        return
      }
      onSubmit(data)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Address Information</CardTitle>
        <CardDescription>Enter your billing and shipping addresses</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleSubmitWithValidation)} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Billing Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="billing-street">Street Address *</Label>
                <Input
                  id="billing-street"
                  {...register("billingAddress.street")}
                  placeholder="Enter street address"
                />
                {errors.billingAddress?.street && (
                  <p className="text-sm text-destructive">{errors.billingAddress.street.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing-city">City *</Label>
                <Input
                  id="billing-city"
                  {...register("billingAddress.city")}
                  placeholder="Enter city"
                />
                {errors.billingAddress?.city && (
                  <p className="text-sm text-destructive">{errors.billingAddress.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing-state">State *</Label>
                <Input
                  id="billing-state"
                  {...register("billingAddress.state")}
                  placeholder="Enter state"
                />
                {errors.billingAddress?.state && (
                  <p className="text-sm text-destructive">{errors.billingAddress.state.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing-zipCode">ZIP Code *</Label>
                <Input
                  id="billing-zipCode"
                  {...register("billingAddress.zipCode")}
                  placeholder="Enter ZIP code"
                />
                {errors.billingAddress?.zipCode && (
                  <p className="text-sm text-destructive">{errors.billingAddress.zipCode.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing-country">Country *</Label>
                <Controller
                  name="billingAddress.country"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      id="billing-country"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select country</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.billingAddress?.country && (
                  <p className="text-sm text-destructive">{errors.billingAddress.country.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              name="sameAsBilling"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  id="same-as-billing"
                  checked={field.value}
                  onChange={(e) => {
                    const isChecked = e.target.checked
                    console.log("[AddressInfoForm] Checkbox toggled to:", isChecked)
                    field.onChange(isChecked)
                    if (isChecked) {
                      const billingAddress = getValues("billingAddress")
                      setValue("shippingAddress", billingAddress)
                      clearErrors("shippingAddress")
                      console.log("[AddressInfoForm] Copied billing to shipping")
                    } else {
                      setValue("shippingAddress", {
                        street: "",
                        city: "",
                        state: "",
                        zipCode: "",
                        country: "India",
                      })
                      console.log("[AddressInfoForm] Reset shipping address")
                    }
                  }}
                  className="h-4 w-4 rounded border border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              )}
            />
            <Label htmlFor="same-as-billing" className="cursor-pointer">
              Shipping address is the same as billing address
            </Label>
          </div>

          {!sameAsBilling && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Shipping Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="shipping-street">Street Address *</Label>
                  <Input
                    id="shipping-street"
                    {...register("shippingAddress.street")}
                    placeholder="Enter street address"
                  />
                  {errors.shippingAddress?.street && (
                    <p className="text-sm text-destructive">{errors.shippingAddress.street.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shipping-city">City *</Label>
                  <Input
                    id="shipping-city"
                    {...register("shippingAddress.city")}
                    placeholder="Enter city"
                  />
                  {errors.shippingAddress?.city && (
                    <p className="text-sm text-destructive">{errors.shippingAddress.city.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shipping-state">State *</Label>
                  <Input
                    id="shipping-state"
                    {...register("shippingAddress.state")}
                    placeholder="Enter state"
                  />
                  {errors.shippingAddress?.state && (
                    <p className="text-sm text-destructive">{errors.shippingAddress.state.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shipping-zipCode">ZIP Code *</Label>
                  <Input
                    id="shipping-zipCode"
                    {...register("shippingAddress.zipCode")}
                    placeholder="Enter ZIP code"
                  />
                  {errors.shippingAddress?.zipCode && (
                    <p className="text-sm text-destructive">{errors.shippingAddress.zipCode.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shipping-country">Country *</Label>
                  <Controller
                    name="shippingAddress.country"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        id="shipping-country"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select country</option>
                        {countries.map((country) => (
                          <option key={country} value={country}>
                            {country}
                        </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.shippingAddress?.country && (
                    <p className="text-sm text-destructive">{errors.shippingAddress.country.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onPrevious} className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
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