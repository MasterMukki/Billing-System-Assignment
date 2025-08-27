import { z } from "zod"
import { customerStorage } from "./storage"

export const countries = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "China",
  "Brazil",
  "Mexico",
  "Italy",
  "Spain",
  "Netherlands",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Switzerland",
  "Austria",
  "Belgium",
  "Ireland",
  "New Zealand",
  "South Korea",
  "Singapore",
  "Malaysia",
  "Thailand",
  "Philippines",
  "Indonesia",
  "Vietnam",
  "South Africa",
  "Nigeria",
  "Egypt",
  "UAE",
  "Saudi Arabia",
  "Israel",
  "Turkey",
  "Russia",
  "Poland",
  "Czech Republic",
  "Hungary",
  "Romania",
  "Bulgaria",
  "Croatia",
  "Greece",
  "Portugal",
  "Argentina",
  "Chile",
  "Colombia",
  "Peru",
  "Venezuela",
]

export const personalInfoSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
  email: z.string().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  phone: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone || phone.trim() === "") return true
      const cleanPhone = phone.replace(/[\s\-()]/g, "")
      const phoneRegex = /^(\+91|91)?[6-9]\d{9}$|^\+?[1-9]\d{6,14}$/
      return phoneRegex.test(cleanPhone)
    }, "Please enter a valid phone number (Indian: 10 digits starting with 6-9, International: 7-15 digits)"),
})

export const addressSchema = z.object({
  street: z
    .string()
    .min(5, "Street address must be at least 5 characters")
    .max(200, "Street address must be less than 200 characters"),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(100, "City must be less than 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "City can only contain letters, spaces, hyphens, and apostrophes"),
  state: z.string().min(2, "State must be at least 2 characters").max(100, "State must be less than 100 characters"),
  zipCode: z
    .string()
    .min(3, "ZIP code must be at least 3 characters")
    .max(20, "ZIP code must be less than 20 characters")
    .regex(/^[a-zA-Z0-9\s-]+$/, "ZIP code can only contain letters, numbers, spaces, and hyphens"),
  country: z
    .string()
    .min(2, "Country must be at least 2 characters")
    .max(100, "Country must be less than 100 characters"),
})

export const addressInfoSchema = z
  .object({
    billingAddress: addressSchema,
    shippingAddress: addressSchema.optional(),
    sameAsBilling: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.sameAsBilling) return true
      return data.shippingAddress && data.shippingAddress.street.trim().length > 0
    },
    {
      message: "Shipping address is required when different from billing",
      path: ["shippingAddress", "street"],
    },
  )

export const customerSchema = z
  .object({
    personalInfo: personalInfoSchema,
    addressInfo: addressInfoSchema,
  })
  .refine(
    async (data) => {
      const emailExists = await customerStorage.emailExists(data.personalInfo.email)
      return !emailExists
    },
    {
      message: "A customer with this email already exists",
      path: ["personalInfo", "email"],
    },
  )

export const invoiceItemSchema = z.object({
  id: z.string(),
  description: z
    .string()
    .min(3, "Description must be at least 3 characters")
    .max(200, "Description must be less than 200 characters"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0").max(999999, "Quantity is too large"),
  price: z.number().min(0, "Price cannot be negative").max(999999.99, "Price is too large"),
})

export const invoiceSchema = z
  .object({
    customerId: z.string().min(1, "Please select a customer"),
    date: z.date(),
    dueDate: z.date(),
    items: z.array(invoiceItemSchema).min(1, "At least one item is required").max(50, "Maximum 50 items allowed"),
    tax: z.number().min(0, "Tax cannot be negative").max(99.99, "Tax rate cannot exceed 99.99%"),
  })
  .refine(
    (data) => {
      return data.dueDate >= data.date
    },
    {
      message: "Due date must be on or after invoice date",
      path: ["dueDate"],
    },
  )

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>
export type AddressInfoFormData = z.infer<typeof addressInfoSchema>
export type CustomerFormData = z.infer<typeof customerSchema>
export type InvoiceFormData = z.infer<typeof invoiceSchema>
export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>
