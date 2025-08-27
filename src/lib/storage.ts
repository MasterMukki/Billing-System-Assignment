export interface Customer {
  id: string
  personalInfo: {
    name: string
    email: string
    phone?: string
  }
  addressInfo: {
    billingAddress: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
    shippingAddress: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
    sameAsBilling: boolean
  }
  createdAt: Date
  updatedAt: Date
}

export interface InvoiceItem {
  [x: string]: any
  id: string
  description: string
  quantity: number
  price: number
  amount: number
}

export interface Invoice {
  id: string
  customerId: string
  invoiceNumber: string
  date: Date
  dueDate: Date
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  status: "paid" | "unpaid" | "overdue"
  createdAt: Date
  updatedAt: Date
}

// Simple IndexedDB wrapper
class SimpleStorage {
  private dbName: string
  private version: number
  private db: IDBDatabase | null = null

  constructor(dbName: string, version = 1) {
    this.dbName = dbName
    this.version = version
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        if (!db.objectStoreNames.contains("customers")) {
          db.createObjectStore("customers", { keyPath: "id" })
        }

        if (!db.objectStoreNames.contains("invoices")) {
          db.createObjectStore("invoices", { keyPath: "id" })
        }
      }
    })
  }

  async setItem(storeName: string, key: string, value: any): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.put({ ...value, id: key })

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getItem<T>(storeName: string, key: string): Promise<T | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }

  async getAllItems<T>(storeName: string): Promise<T[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || [])
    })
  }

  async removeItem(storeName: string, key: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }
}

const storage = new SimpleStorage("BillingSystem")

// Customer operations
export const customerStorage = {
  async create(customer: Omit<Customer, "id" | "createdAt" | "updatedAt">): Promise<Customer> {
    const id = crypto.randomUUID()
    const now = new Date()
    const newCustomer: Customer = {
      ...customer,
      id,
      createdAt: now,
      updatedAt: now,
    }
    await storage.setItem("customers", id, newCustomer)
    return newCustomer
  },

  async getAll(): Promise<Customer[]> {
    const customers = await storage.getAllItems<Customer>("customers")
    return customers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async getById(id: string): Promise<Customer | null> {
    return await storage.getItem<Customer>("customers", id)
  },

  async update(id: string, updates: Partial<Customer>): Promise<Customer | null> {
    const existing = await storage.getItem<Customer>("customers", id)
    if (!existing) return null

    const updated: Customer = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    }
    await storage.setItem("customers", id, updated)
    return updated
  },

  async delete(id: string): Promise<boolean> {
    try {
      await storage.removeItem("customers", id)
      return true
    } catch {
      return false
    }
  },

  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const customers = await this.getAll()
    return customers.some(
      (customer) => customer.personalInfo.email.toLowerCase() === email.toLowerCase() && customer.id !== excludeId,
    )
  },
}

// Invoice operations
export const invoiceStorage = {
  async create(invoice: Omit<Invoice, "id" | "createdAt" | "updatedAt" | "invoiceNumber">): Promise<Invoice> {
    const id = crypto.randomUUID()
    const now = new Date()
    const invoiceNumber = `INV-${Date.now()}`

    const newInvoice: Invoice = {
      ...invoice,
      id,
      invoiceNumber,
      createdAt: now,
      updatedAt: now,
    }
    await storage.setItem("invoices", id, newInvoice)
    return newInvoice
  },

  async getAll(): Promise<Invoice[]> {
    const invoices = await storage.getAllItems<Invoice>("invoices")
    return invoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async getByCustomerId(customerId: string): Promise<Invoice[]> {
    const allInvoices = await this.getAll()
    return allInvoices.filter((invoice) => invoice.customerId === customerId)
  },

  async getById(id: string): Promise<Invoice | null> {
    return await storage.getItem<Invoice>("invoices", id)
  },

  async update(id: string, updates: Partial<Invoice>): Promise<Invoice | null> {
    const existing = await storage.getItem<Invoice>("invoices", id)
    if (!existing) return null

    const updated: Invoice = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    }
    await storage.setItem("invoices", id, updated)
    return updated
  },

  async delete(id: string): Promise<boolean> {
    try {
      await storage.removeItem("invoices", id)
      return true
    } catch {
      return false
    }
  },
}
