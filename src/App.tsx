import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Sidebar } from "./components/layout/Sidebar"
import { Header } from "./components/layout/Header"
import Dashboard from "./pages/Dashboard"
import Customers from "./pages/Customer"
import NewCustomer from "./pages/NewCustomer"
import Invoices from "./pages/Invoices"
import NewInvoice from "./pages/NewInvoice"
import "./index.css"
import { Suspense } from "react"
import LoadingFallback from "./components/LoadingFallback"
import { Toaster } from "sonner"

function App() {
  return (
    <>
      <Toaster 
      position="top-right" 
      richColors 
      closeButton 
      duration={3000} 
    />
      <Router>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <div className="flex flex-1 flex-col min-w-0 md:ml-64 transition-all duration-300 main-content">
            <Header />
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/invoices" element={<Invoices />} />
                  <Route path="/customers/new" element={<NewCustomer />} />
                  <Route path="/invoices/new" element={<NewInvoice />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </div>
      </Router>
    </>
  )
}

export default App
