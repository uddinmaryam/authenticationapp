import { z } from 'zod'

export const UsernameValidation = z
  .string()
  .min(2, "username must at least be of two characters")
  .max(20, "username must be less than 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/,"valid username is required")

export const signUpSchema = z.object({
    username: UsernameValidation,
    email: z.string().email({ message: "Invalid email address" }), 
    password: z.string().min(8,"password must be of 8 characters minimum")
})