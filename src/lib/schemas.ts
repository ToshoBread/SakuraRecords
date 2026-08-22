import { z } from 'zod'

export const clientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
})

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  code: z.string().min(1, 'Code is required').max(50),
  description: z.string().max(1000).optional().or(z.literal('')),
  kg: z.number().min(0, 'Weight must be non-negative'),
})

export const addressSchema = z.object({
  name: z.string().min(1, 'Label is required').max(255),
  address: z.string().min(1, 'Address is required').max(500),
})

export const purchaseOrderSchema = z.object({
  purchaseOrderNumber: z.string().min(1, 'PO number is required').max(50),
  clientId: z.string().min(1, 'Client is required'),
  notes: z.string().max(1000).optional().or(z.literal('')),
  products: z.array(z.object({
    productId: z.number(),
    name: z.string(),
    code: z.string(),
    ordered_quantity: z.number().min(1, 'Quantity must be at least 1'),
    price_per_kg: z.number().min(0, 'Price must be non-negative'),
  })).min(1, 'At least one product is required'),
})

export const purchaseOrderEditSchema = z.object({
  notes: z.string().max(1000).optional().or(z.literal('')),
  products: z.array(z.object({
    productId: z.number(),
    name: z.string(),
    code: z.string(),
    ordered_quantity: z.number().min(1, 'Quantity must be at least 1'),
    price_per_kg: z.number().min(0, 'Price must be non-negative'),
  })).min(1, 'At least one product is required'),
})

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const deliverySchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  shipped_quantity: z.number().min(1, 'Quantity must be at least 1'),
  delivery_date: z.string().min(1, 'Delivery date is required'),
  payment_terms: z.number().min(0, 'Payment terms must be non-negative'),
  delivered: z.boolean(),
  addressId: z.string().min(1, 'Address is required'),
  transactionDocumentId: z.string().min(1, 'Transaction document is required'),
  deliveryRequirementId: z.string().min(1, 'Delivery requirement is required'),
})

export const adminPasswordResetSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type ClientInput = z.infer<typeof clientSchema>
export type ProductInput = z.infer<typeof productSchema>
export type AddressInput = z.infer<typeof addressSchema>
export type PurchaseOrderInput = z.infer<typeof purchaseOrderSchema>
export type PurchaseOrderEditInput = z.infer<typeof purchaseOrderEditSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type DeliveryInput = z.infer<typeof deliverySchema>
export type AdminPasswordResetInput = z.infer<typeof adminPasswordResetSchema>
