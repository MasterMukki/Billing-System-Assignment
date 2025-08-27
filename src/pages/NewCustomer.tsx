/**
 * NewCustomer Page Component
 * Page for creating new customers using the CustomerForm component
 */

import { CustomerForm } from "@/components/customers/CustomerForm"

const NewCustomer: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <CustomerForm />
    </div>
  )
}

export default NewCustomer
