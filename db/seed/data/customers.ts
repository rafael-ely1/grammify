import { type InsertCustomer } from "../../schema/customers"

// TODO: Replace with your own user ID system
export const userId = "test-user-1"

export const customersData: InsertCustomer[] = [
  {
    userId,
    membership: "pro", // default to pro for testing
    createdAt: new Date(),
    updatedAt: new Date()
  }
]
