"use server"

import { db } from "@/db"
import { customers, type SelectCustomer } from "@/db/schema/customers"
import { eq } from "drizzle-orm"

export async function getCustomerByUserId(
  userId: string
): Promise<SelectCustomer | null> {
  const customer = await db.query.customers.findFirst({
    where: eq(customers.userId, userId)
  })

  return customer || null
}

export async function getBillingDataByUserId(userId: string): Promise<{
  customer: SelectCustomer | null
  email: string | null
}> {
  // TODO: Replace with your own user data handling
  const email = null

  // Get profile
  const customer = await db.query.customers.findFirst({
    where: eq(customers.userId, userId)
  })

  return {
    customer: customer || null,
    email
  }
}

export async function createCustomer(
  userId: string
): Promise<{ isSuccess: boolean; data?: SelectCustomer }> {
  try {
    const [newCustomer] = await db
      .insert(customers)
      .values({
        userId,
        membership: "free"
      })
      .returning()

    if (!newCustomer) {
      return { isSuccess: false }
    }

    return { isSuccess: true, data: newCustomer }
  } catch (error) {
    console.error("Error creating customer:", error)
    return { isSuccess: false }
  }
}

export async function updateCustomerByUserId(
  userId: string,
  updates: Partial<SelectCustomer>
): Promise<{ isSuccess: boolean; data?: SelectCustomer }> {
  try {
    const [updatedCustomer] = await db
      .update(customers)
      .set(updates)
      .where(eq(customers.userId, userId))
      .returning()

    if (!updatedCustomer) {
      return { isSuccess: false }
    }

    return { isSuccess: true, data: updatedCustomer }
  } catch (error) {
    console.error("Error updating customer by userId:", error)
    return { isSuccess: false }
  }
}
