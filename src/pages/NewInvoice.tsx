/**
 * NewInvoice Page Component
 * Page for creating new invoices using the InvoiceForm component
 */

import { InvoiceForm } from "@/components/invoices/InvoiceForm"

const NewInvoice: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <InvoiceForm />
    </div>
  )
}

export default NewInvoice
