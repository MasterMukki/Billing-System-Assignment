import { useState, useEffect } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, FileText } from "lucide-react"
import { customerStorage, invoiceStorage, type Customer, type InvoiceItem } from "@/lib/storage"
import { invoiceSchema, type InvoiceFormData } from "@/lib/validations"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

interface InvoiceFormProps {
  customerId?: string
}

export function InvoiceForm({ customerId }: InvoiceFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerId: customerId || "",
      date: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      items: [
        {
          id: crypto.randomUUID(),
          description: "",
          quantity: 1,
          price: 0,
        },
      ],
      tax: 0,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      setIsLoading(true)
      const data = await customerStorage.getAll()
      setCustomers(data)
    } catch (error) {
      console.error("Failed to load customers:", error)
      toast.error("Failed to load customers")
    } finally {
      setIsLoading(false)
    }
  }

  const calculateTotals = () => {
    const items = form.watch("items")
    const tax = form.watch("tax")

    const subtotal = items.reduce((sum, item) => {
      const amount = (item.quantity || 0) * (item.price || 0)
      return sum + amount
    }, 0)

    const taxAmount = (subtotal * tax) / 100
    const total = subtotal + taxAmount

    return { subtotal, taxAmount, total }
  }

  const addItem = () => {
    append({
      id: crypto.randomUUID(),
      description: "",
      quantity: 1,
      price: 0,
    })
  }

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  const onSubmit = async (data: InvoiceFormData) => {
    setIsSubmitting(true)
    try {
      const { subtotal, taxAmount, total } = calculateTotals()

      // Transform items to include amount calculation
      const processedItems: InvoiceItem[] = data.items.map((item) => ({
        ...item,
        amount: item.quantity * item.price,
      }))

      const invoice = await invoiceStorage.create({
        customerId: data.customerId,
        date: data.date,
        dueDate: data.dueDate,
        items: processedItems,
        subtotal,
        tax: taxAmount,
        total,
        status: "unpaid",
      })

      console.log("[v0] Invoice created successfully:", invoice)
      toast.success("Invoice created successfully!")
      navigate('/invoices')
    } catch (error) {
      console.error("[v0] Failed to create invoice:", error)
      toast.error("Failed to create invoice. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const { subtotal, taxAmount, total } = calculateTotals()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              Create Invoice
            </h1>
            <p className="text-gray-600 mt-2">Generate a professional invoice for your customer</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Invoice #</div>
            <div className="text-lg font-mono font-bold">INV-{Date.now()}</div>
          </div>
        </div>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-xl text-gray-800">Invoice Details</CardTitle>
          <CardDescription className="text-gray-600">Fill in the invoice information below</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Invoice Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="customer" className="text-sm font-semibold text-gray-700">
                  Customer *
                </Label>
                <Controller
                  name="customerId"
                  control={form.control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.personalInfo.name} - {customer.personalInfo.email}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {form.formState.errors.customerId && (
                  <p className="text-sm text-red-600">{form.formState.errors.customerId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-semibold text-gray-700">
                  Invoice Date *
                </Label>
                <Controller
                  name="date"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      type="date"
                      className="h-11"
                      value={field.value ? field.value.toISOString().split("T")[0] : ""}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  )}
                />
                {form.formState.errors.date && (
                  <p className="text-sm text-red-600">{form.formState.errors.date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-sm font-semibold text-gray-700">
                  Due Date *
                </Label>
                <Controller
                  name="dueDate"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      type="date"
                      className="h-11"
                      value={field.value ? field.value.toISOString().split("T")[0] : ""}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  )}
                />
                {form.formState.errors.dueDate && (
                  <p className="text-sm text-red-600">{form.formState.errors.dueDate.message}</p>
                )}
              </div>
            </div>

            {/* Invoice Items */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Invoice Items</h3>
                <Button
                  type="button"
                  onClick={addItem}
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold text-gray-700">Description</TableHead>
                      <TableHead className="w-24 font-semibold text-gray-700">Qty</TableHead>
                      <TableHead className="w-32 font-semibold text-gray-700">Price</TableHead>
                      <TableHead className="w-32 font-semibold text-gray-700">Amount</TableHead>
                      <TableHead className="w-16 font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id} className="hover:bg-gray-50">
                        <TableCell className="p-3">
                          <Input
                            {...form.register(`items.${index}.description`)}
                            placeholder="Item description"
                            className="border-gray-200"
                          />
                          {form.formState.errors.items?.[index]?.description && (
                            <p className="text-xs text-red-600 mt-1">
                              {form.formState.errors.items[index]?.description?.message}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="p-3">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            className="border-gray-200"
                            {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                          />
                          {form.formState.errors.items?.[index]?.quantity && (
                            <p className="text-xs text-red-600 mt-1">
                              {form.formState.errors.items[index]?.quantity?.message}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="p-3">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            className="border-gray-200"
                            {...form.register(`items.${index}.price`, { valueAsNumber: true })}
                          />
                          {form.formState.errors.items?.[index]?.price && (
                            <p className="text-xs text-red-600 mt-1">
                              {form.formState.errors.items[index]?.price?.message}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="p-3">
                          <div className="font-semibold text-gray-800 bg-gray-50 px-3 py-2 rounded">
                            $
                            {(
                              (form.watch(`items.${index}.quantity`) || 0) * (form.watch(`items.${index}.price`) || 0)
                            ).toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell className="p-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(index)}
                            disabled={fields.length === 1}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Tax and Totals */}
            <div className="flex justify-end">
              <div className="w-80 space-y-4 bg-gray-50 p-6 rounded-lg border">
                <div className="flex justify-between items-center">
                  <Label htmlFor="tax" className="text-sm font-semibold text-gray-700">
                    Tax Rate (%)
                  </Label>
                  <div className="w-24">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="99.99"
                      className="text-center"
                      {...form.register("tax", { valueAsNumber: true })}
                    />
                  </div>
                </div>
                {form.formState.errors.tax && (
                  <p className="text-sm text-red-600">{form.formState.errors.tax.message}</p>
                )}

                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax:</span>
                    <span className="font-medium">${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xl text-gray-900 pt-2 border-t border-gray-300">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="submit" disabled={isSubmitting} className="px-8 bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? "Creating..." : "Create Invoice"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
