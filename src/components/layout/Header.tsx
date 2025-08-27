/**
 * Header Component
 * Main application header with navigation and theme toggle functionality
 * 
 * Features:
 * - Application title display
 * - Theme toggle (light/dark mode)
 * - Responsive design
 * - Sticky positioning with backdrop blur
 */

export function Header() {

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 lg:px-8">
      {/* Left side - Application title and mobile menu spacer */}
      <div className="flex items-center gap-4">
        <div className="md:hidden w-10" /> {/* Spacer for mobile menu button */}
        <h2 className="text-base md:text-lg font-semibold text-foreground truncate">
          <span className="hidden sm:inline">Professional Billing Management</span>
          <span className="sm:hidden">Billing System</span>
        </h2>
      </div>
    </header>
  )
}
