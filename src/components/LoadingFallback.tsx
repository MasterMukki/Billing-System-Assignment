/**
 * LoadingFallback Component
 * A loading spinner component used as fallback for Suspense
 */

export default function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}
