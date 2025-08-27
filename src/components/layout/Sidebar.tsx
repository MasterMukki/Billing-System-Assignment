/**
 * Sidebar Component
 * Main navigation sidebar with collapsible menu and responsive design
 *
 * Features:
 * - Collapsible sidebar navigation (mobile and desktop)
 * - Active route highlighting
 * - Mobile-responsive design
 * - Smooth animations and transitions
 * - Icon-based navigation items
 * - Desktop collapse/expand functionality
 */

import { useState } from "react"
import { useLocation, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Home, Users, FileText, Plus, Receipt, X, Menu, ChevronLeft, ChevronRight } from "lucide-react"

// Navigation items configuration
const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "New Customer", href: "/customers/new", icon: Plus },
  { name: "New Invoice", href: "/invoices/new", icon: Receipt },
]

/**
 * Main Sidebar component
 * Provides navigation menu with collapsible functionality
 */
export function Sidebar() {
  // State for mobile menu open/close
  const [isOpen, setIsOpen] = useState(false)
  // State for desktop sidebar collapsed/expanded
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Get current location for active route highlighting
  const location = useLocation()
  const pathname = location.pathname

  /**
   * Toggles the mobile sidebar visibility
   */
  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  /**
   * Closes the mobile sidebar
   */
  const closeSidebar = () => {
    setIsOpen(false)
  }

  /**
   * Toggles the desktop sidebar collapsed state
   */
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <>
      {/* Mobile overlay - darkens background when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Main sidebar container */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transform bg-white border-r border-gray-200 transition-all duration-300 ease-in-out shadow-lg sidebar",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
          isCollapsed ? "md:w-16" : "md:w-64"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header with logo and close button */}
          <div className="flex h-16 items-center px-4 md:px-6 border-b border-gray-200">
            <h1 className={cn(
              "text-xl font-bold text-gray-900 transition-all duration-300",
              isCollapsed ? "md:hidden" : "md:block"
            )}>
              BillManager
            </h1>
            <div className="ml-auto flex items-center gap-2">
              {/* Desktop collapse toggle button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCollapse}
                className="hidden md:flex h-8 w-8"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
              {/* Mobile close button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8"
                onClick={toggleSidebar}
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation menu with scrollable content */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-2">
              {navigation.map((item) => {
                // Determine if current route is active
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href))

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={closeSidebar}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-700"
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className={cn(
                      "transition-all duration-300",
                      isCollapsed ? "md:hidden" : "md:block"
                    )}>
                      {item.name}
                    </span>
                  </Link>
                )
              })}
            </nav>
          </ScrollArea>
        </div>
      </div>

      {/* Mobile menu button - only visible on mobile */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Open sidebar"
          className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>
    </>
  )
}
