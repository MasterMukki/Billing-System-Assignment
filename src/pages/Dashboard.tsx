/**
 * Dashboard Page Component
 * Main dashboard view showing customer overview and quick actions
 * 
 * Features:
 * - Customer overview with search functionality
 * - Quick customer management actions
 * - Responsive grid layout
 * - Loading states and error handling
 * - Customer statistics and information display
 */

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Mail, Phone, MapPin, Users, FileText, DollarSign, TrendingUp } from "lucide-react"
import { customerStorage, invoiceStorage } from "@/lib/storage"
import type { Customer, Invoice } from "@/lib/storage"

/**
 * Dashboard component
 * Displays overview of customers and invoices with quick actions
 */
const Dashboard: React.FC = () => {
  // State management for dashboard data
  const [customers, setCustomers] = useState<Customer[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  // Load dashboard data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        // Load both customers and invoices in parallel
        const [customersData, invoicesData] = await Promise.all([
          customerStorage.getAll(),
          invoiceStorage.getAll()
        ])
        setCustomers(customersData)
        setInvoices(invoicesData)
        setFilteredCustomers(customersData)
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  // Filter customers based on search term
  useEffect(() => {
    const filtered = customers.filter(
      (customer) =>
        customer.personalInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredCustomers(filtered)
  }, [searchTerm, customers])

  // Calculate dashboard statistics
  const totalCustomers = customers.length
  const totalInvoices = invoices.length
  const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.total, 0)
  const paidInvoices = invoices.filter(invoice => invoice.status === "paid").length

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header with title and actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-start md:justify-between gap-5 md:gap-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Link to="/customers/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </Link>
          <Link to="/invoices/new">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Active customer accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              All time invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From all invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidInvoices}</div>
            <p className="text-xs text-muted-foreground">
              Successfully paid
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Search Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Customers</h2>
          <Link to="/customers" className="text-sm text-primary hover:underline">
            View All
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search customers by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Customer List Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.slice(0, 6).map((customer) => (
              <Card key={customer.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{customer.personalInfo.name}</span>
                    <Badge variant="outline">Active</Badge>
                  </CardTitle>
                  <CardDescription>
                    Customer since {new Date(customer.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* Customer Email */}
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.personalInfo.email}</span>
                  </div>
                  
                  {/* Customer Phone (if available) */}
                  {customer.personalInfo.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.personalInfo.phone}</span>
                    </div>
                  )}
                  
                  {/* Customer Location */}
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {customer.addressInfo.billingAddress.city}, {customer.addressInfo.billingAddress.country}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            // Empty state when no customers found
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm ? "No customers found matching your search." : "No customers yet."}
              </p>
                             {!searchTerm && (
                 <Link to="/customers/new">
                   <Button className="mt-4">
                     <Plus className="h-4 w-4 mr-2" />
                     Add Your First Customer
                   </Button>
                 </Link>
               )}
            </div>
          )}
        </div>

        {/* Show more customers link if there are more than 6 */}
        {filteredCustomers.length > 6 && (
          <div className="text-center">
            <Link to="/customers">
              <Button variant="outline">
                View All {filteredCustomers.length} Customers
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard