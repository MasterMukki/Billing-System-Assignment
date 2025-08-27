import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Eye, Trash2, Users, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { customerStorage, type Customer } from "@/lib/storage"
import { toast } from "sonner"

export function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [sortKey, setSortKey] = useState<keyof Customer["personalInfo"] | "location" | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  useEffect(() => {
    loadCustomers()
  }, [])

  useEffect(() => {
    filterAndSortCustomers()
  }, [customers, searchTerm, sortKey, sortDirection])

  const loadCustomers = async () => {
    try {
      setIsLoading(true)
      const data = await customerStorage.getAll()
      console.log("[CustomerList] Loaded customers:", data)
      setCustomers(data)
    } catch (error) {
      console.error("[CustomerList] Failed to load customers:", error)
      toast.error("Failed to load customers.")
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortCustomers = () => {
    let filtered = [...customers]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.personalInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (customer.personalInfo.phone && customer.personalInfo.phone.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Apply sorting
    if (sortKey) {
      filtered.sort((a, b) => {
        let valueA: string | undefined
        let valueB: string | undefined

        if (sortKey === "location") {
          valueA = `${a.addressInfo.billingAddress.city}, ${a.addressInfo.billingAddress.state}`.toLowerCase()
          valueB = `${b.addressInfo.billingAddress.city}, ${b.addressInfo.billingAddress.state}`.toLowerCase()
        } else {
          valueA = a.personalInfo[sortKey]?.toLowerCase()
          valueB = b.personalInfo[sortKey]?.toLowerCase()
        }

        // Handle undefined values
        if (!valueA && !valueB) return 0
        if (!valueA) return sortDirection === "asc" ? 1 : -1
        if (!valueB) return sortDirection === "asc" ? -1 : 1

        return sortDirection === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA)
      })
    }

    setFilteredCustomers(filtered)
  }

  const handleSort = (key: keyof Customer["personalInfo"] | "location") => {
    if (sortKey === key) {
      // Toggle direction if same key
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Set new sort key and default to ascending
      setSortKey(key)
      setSortDirection("asc")
    }
  }

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      await customerStorage.delete(customerId)
      await loadCustomers()
      toast.success("Customer deleted successfully.")
    } catch (error) {
      console.error("[CustomerList] Failed to delete customer:", error)
      toast.error("Failed to delete customer.")
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database and view customer information</p>
        </div>
        <Link to="/customers/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Customers</CardTitle>
          <CardDescription>Find customers by name, email, or phone number</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>
            {filteredCustomers.length} of {customers.length} customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No customers found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm ? "Try adjusting your search criteria" : "Get started by adding your first customer"}
              </p>
              {!searchTerm && (
                <Link to="/customers/new">
                  <Button>Add Customer</Button>
                </Link>
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
                      onClick={() => handleSort("name")}
                    >
                      Name
                      {sortKey === "name" && (
                        sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      )}
                      {sortKey !== "name" && <ArrowUpDown className="h-4 w-4" />}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2"
                      onClick={() => handleSort("email")}
                    >
                      Email
                      {sortKey === "email" && (
                        sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      )}
                      {sortKey !== "email" && <ArrowUpDown className="h-4 w-4" />}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2"
                      onClick={() => handleSort("phone")}
                    >
                      Phone
                      {sortKey === "phone" && (
                        sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      )}
                      {sortKey !== "phone" && <ArrowUpDown className="h-4 w-4" />}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2"
                      onClick={() => handleSort("location")}
                    >
                      Location
                      {sortKey === "location" && (
                        sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      )}
                      {sortKey !== "location" && <ArrowUpDown className="h-4 w-4" />}
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.personalInfo.name}</TableCell>
                    <TableCell>{customer.personalInfo.email}</TableCell>
                    <TableCell>{customer.personalInfo.phone || "N/A"}</TableCell>
                    <TableCell>
                      {customer.addressInfo.billingAddress.city}, {customer.addressInfo.billingAddress.state}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Active</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedCustomer(customer)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Customer Details</DialogTitle>
                              <DialogDescription>
                                Complete information for {customer.personalInfo.name}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedCustomer && (
                              <div className="space-y-6">
                                {/* Personal Information */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium">Name:</span> {selectedCustomer.personalInfo.name}
                                    </div>
                                    <div>
                                      <span className="font-medium">Email:</span> {selectedCustomer.personalInfo.email}
                                    </div>
                                    {selectedCustomer.personalInfo.phone && (
                                      <div>
                                        <span className="font-medium">Phone:</span>{" "}
                                        {selectedCustomer.personalInfo.phone}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Address Information */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-3">Address Information</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                      <h4 className="font-medium mb-2">Billing Address</h4>
                                      <div className="text-sm space-y-1">
                                        <div>{selectedCustomer.addressInfo.billingAddress.street}</div>
                                        <div>
                                          {selectedCustomer.addressInfo.billingAddress.city},{" "}
                                          {selectedCustomer.addressInfo.billingAddress.state}{" "}
                                          {selectedCustomer.addressInfo.billingAddress.zipCode}
                                        </div>
                                        <div>{selectedCustomer.addressInfo.billingAddress.country}</div>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-medium mb-2">Shipping Address</h4>
                                      <div className="text-sm space-y-1">
                                        {selectedCustomer.addressInfo.sameAsBilling ? (
                                          <div className="text-muted-foreground">Same as billing address</div>
                                        ) : (
                                          <>
                                            <div>{selectedCustomer.addressInfo.shippingAddress.street}</div>
                                            <div>
                                              {selectedCustomer.addressInfo.shippingAddress.city},{" "}
                                              {selectedCustomer.addressInfo.shippingAddress.state}{" "}
                                              {selectedCustomer.addressInfo.shippingAddress.zipCode}
                                            </div>
                                            <div>{selectedCustomer.addressInfo.shippingAddress.country}</div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Metadata */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-3">Account Information</h3>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium">Created:</span>{" "}
                                      {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                                    </div>
                                    <div>
                                      <span className="font-medium">Updated:</span>{" "}
                                      {new Date(selectedCustomer.updatedAt).toLocaleDateString()}
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
                                This action cannot be undone. This will permanently delete the customer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCustomer(customer.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete Customer
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
    </div>
  )
}