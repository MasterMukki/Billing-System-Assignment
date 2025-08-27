import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Search, Plus, FileText, Eye, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { customerStorage, invoiceStorage, type Customer, type Invoice } from "@/lib/storage"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

// Extended invoice interface that includes customer information
interface InvoiceWithCustomer extends Invoice {
  customer: Customer
}

export function InvoiceList() {
  const [invoices, setInvoices] = useState<InvoiceWithCustomer[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<InvoiceWithCustomer[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithCustomer | null>(null)
  const [sortKey, setSortKey] = useState<keyof Invoice | "customer" | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterInvoices()
  }, [invoices, searchTerm, selectedCustomerId, statusFilter, sortKey, sortDirection])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [invoicesData, customersData] = await Promise.all([invoiceStorage.getAll(), customerStorage.getAll()])

      // Combine invoices with customer data
      const invoicesWithCustomers: InvoiceWithCustomer[] = []
      for (const invoice of invoicesData) {
        const customer = customersData.find((c) => c.id === invoice.customerId)
        if (customer) {
          invoicesWithCustomers.push({ ...invoice, customer })
        }
      }

      setInvoices(invoicesWithCustomers)
      setCustomers(customersData)
    } catch (error) {
      console.error("[InvoiceList] Failed to load data:", error)
      toast.error("Failed to load data.")
    } finally {
      setIsLoading(false)
    }
  }

  const filterInvoices = () => {
    let filtered = [...invoices]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.customer.personalInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.customer.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply customer filter
    if (selectedCustomerId !== "all") {
      filtered = filtered.filter((invoice) => invoice.customerId === selectedCustomerId)
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter)
    }

    // Apply sorting
    if (sortKey) {
      filtered.sort((a, b) => {
        let valueA: string | number | Date
        let valueB: string | number | Date

        if (sortKey === "customer") {
          valueA = a.customer.personalInfo.name.toLowerCase()
          valueB = b.customer.personalInfo.name.toLowerCase()
        } else if (sortKey === "date" || sortKey === "dueDate") {
          valueA = new Date(a[sortKey])
          valueB = new Date(b[sortKey])
        } else if (sortKey === "total") {
          valueA = a.total
          valueB = b.total
        } else {
          valueA = a[sortKey]?.toString().toLowerCase() || ""
          valueB = b[sortKey]?.toString().toLowerCase() || ""
        }

        // Handle undefined values
        if (!valueA && !valueB) return 0
        if (!valueA) return sortDirection === "asc" ? 1 : -1
        if (!valueB) return sortDirection === "asc" ? -1 : 1

        if (sortKey === "date" || sortKey === "dueDate") {
          return sortDirection === "asc"
          //@ts-ignore
            ? valueA?.getTime() - valueB?.getTime()
                      //@ts-ignore

            : valueB.getTime() - valueA.getTime()
        } else if (sortKey === "total") {
          return sortDirection === "asc"
            ? (valueA as number) - (valueB as number)
            : (valueB as number) - (valueA as number)
        } else {
          return sortDirection === "asc"
            ? (valueA as string).localeCompare(valueB as string)
            : (valueB as string).localeCompare(valueA as string)
        }
      })
    }

    setFilteredInvoices(filtered)
  }

  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "unpaid":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const handleSort = (key: keyof Invoice | "customer") => {
    if (sortKey === key) {
      // Toggle direction if same key
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Set new sort key and default to ascending
      setSortKey(key)
      setSortDirection("asc")
    }
  }

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      await invoiceStorage.delete(invoiceId)
      toast.success("Invoice deleted successfully.")
      await loadData()
    } catch (error) {
      console.error("[InvoiceList] Failed to delete invoice:", error)
      toast.error("Failed to delete invoice.")
    }
  }

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
    <div className="space-y-6">
      {/* Header section with title and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Manage your invoices and billing information</p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/invoices/new")}>
          <Plus className="h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      {/* Search and filter controls */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find invoices by number, customer name, or email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Customer filter dropdown */}
            <div className="w-full sm:w-48">
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">All Customers</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.personalInfo.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status filter dropdown */}
            <div className="w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
          <CardDescription>
            {filteredInvoices.length} of {invoices.length} invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm || selectedCustomerId !== "all" || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by creating your first invoice"}
              </p>
              {!searchTerm && selectedCustomerId === "all" && statusFilter === "all" && (
                <Button onClick={() => navigate("/invoices/new")}>Create Invoice</Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2"
                      onClick={() => handleSort("invoiceNumber")}
                    >
                      Invoice #
                      {sortKey === "invoiceNumber" && (
                        sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      )}
                      {sortKey !== "invoiceNumber" && <ArrowUpDown className="h-4 w-4" />}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2"
                      onClick={() => handleSort("customer")}
                    >
                      Customer
                      {sortKey === "customer" && (
                        sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      )}
                      {sortKey !== "customer" && <ArrowUpDown className="h-4 w-4" />}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2"
                      onClick={() => handleSort("date")}
                    >
                      Date
                      {sortKey === "date" && (
                        sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      )}
                      {sortKey !== "date" && <ArrowUpDown className="h-4 w-4" />}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2"
                      onClick={() => handleSort("dueDate")}
                    >
                      Due Date
                      {sortKey === "dueDate" && (
                        sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      )}
                      {sortKey !== "dueDate" && <ArrowUpDown className="h-4 w-4" />}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2"
                      onClick={() => handleSort("total")}
                    >
                      Amount
                      {sortKey === "total" && (
                        sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      )}
                      {sortKey !== "total" && <ArrowUpDown className="h-4 w-4" />}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2"
                      onClick={() => handleSort("status")}
                    >
                      Status
                      {sortKey === "status" && (
                        sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      )}
                      {sortKey !== "status" && <ArrowUpDown className="h-4 w-4" />}
                    </Button>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.customer.personalInfo.name}</div>
                        <div className="text-sm text-muted-foreground">{invoice.customer.personalInfo.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">${invoice.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(invoice)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Invoice Details</DialogTitle>
                              <DialogDescription>Complete information for {invoice.invoiceNumber}</DialogDescription>
                            </DialogHeader>
                            {selectedInvoice && (
                              <div className="space-y-6">
                                {/* Invoice Header */}
                                <div className="grid grid-cols-2 gap-6">
                                  <div>
                                    <h3 className="text-lg font-semibold mb-3">Invoice Information</h3>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <span className="font-medium">Invoice #:</span> {selectedInvoice.invoiceNumber}
                                      </div>
                                      <div>
                                        <span className="font-medium">Date:</span>{" "}
                                        {new Date(selectedInvoice.date).toLocaleDateString()}
                                      </div>
                                      <div>
                                        <span className="font-medium">Due Date:</span>{" "}
                                        {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                                      </div>
                                      <div>
                                        <span className="font-medium">Status:</span>
                                        <Badge className={`ml-2 ${getStatusColor(selectedInvoice.status)}`}>
                                          {selectedInvoice.status.charAt(0).toUpperCase() +
                                            selectedInvoice.status.slice(1)}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <span className="font-medium">Name:</span>{" "}
                                        {selectedInvoice.customer.personalInfo.name}
                                      </div>
                                      <div>
                                        <span className="font-medium">Email:</span>{" "}
                                        {selectedInvoice.customer.personalInfo.email}
                                      </div>
                                      {selectedInvoice.customer.personalInfo.phone && (
                                        <div>
                                          <span className="font-medium">Phone:</span>{" "}
                                          {selectedInvoice.customer.personalInfo.phone}
                                        </div>
                                      )}
                                      <div className="mt-3">
                                        <span className="font-medium">Billing Address:</span>
                                        <div className="text-sm text-muted-foreground mt-1">
                                          {selectedInvoice.customer.addressInfo.billingAddress.street}
                                          <br />
                                          {selectedInvoice.customer.addressInfo.billingAddress.city},{" "}
                                          {selectedInvoice.customer.addressInfo.billingAddress.state}{" "}
                                          {selectedInvoice.customer.addressInfo.billingAddress.zipCode}
                                          <br />
                                          {selectedInvoice.customer.addressInfo.billingAddress.country}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Invoice Items */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-3">Invoice Items</h3>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Amount</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {selectedInvoice.items.map((item, index) => (
                                        <TableRow key={index}>
                                          <TableCell>{item.description}</TableCell>
                                          <TableCell>{item.quantity}</TableCell>
                                          <TableCell>${item.price.toFixed(2)}</TableCell>
                                          <TableCell>${item.amount.toFixed(2)}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>

                                {/* Invoice Totals */}
                                <div className="border-t pt-4">
                                  <div className="flex justify-end">
                                    <div className="w-64 space-y-2">
                                      <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>${selectedInvoice.subtotal.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Tax:</span>
                                        <span>${selectedInvoice.tax.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                                        <span>Total:</span>
                                        <span>${selectedInvoice.total.toFixed(2)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive bg-transparent"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the invoice "
                                {invoice.invoiceNumber}" and remove it from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteInvoice(invoice.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete Invoice
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Results summary */}
      {filteredInvoices.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredInvoices.length} of {invoices.length} invoices
        </div>
      )}
    </div>
  )
}