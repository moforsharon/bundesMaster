"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Download, Loader2 } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

// Define the form schema with validation
const newUserSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z
  .string()
  .min(9, { message: "Please enter a valid phone number" })
  .regex(/^(\+237|237)?[5-9]\d{8}$/, { message: "Please enter a valid Cameroon phone number" }),
})

const returningUserSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z
    .string()
    .min(9, { message: "Please enter a valid phone number" })
    .regex(/^(\+237|237)?[5-9]\d{8}$/,  { message: "Please enter a valid phone number" }),
})

type NewUserFormValues = z.infer<typeof newUserSchema>
type ReturningUserFormValues = z.infer<typeof returningUserSchema>

interface UserLoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (userId: string, name?: string) => void;
  isNewUser: boolean
  levelId: number
  gameStats: any
}

export default function UserLoginModal({
  isOpen,
  onClose,
  onSuccess,
  isNewUser,
  levelId,
  gameStats,
}: UserLoginModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
    // Add state to control which form is shown, initialized based on isNewUser
    const [showNewUserForm, setShowNewUserForm] = useState(isNewUser)

    // Reset form view when isNewUser changes
    useEffect(() => {
      setShowNewUserForm(isNewUser)
    }, [isNewUser])

  // Setup form for new users
  const newUserForm = useForm<NewUserFormValues>({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  })

  // Setup form for returning users
  const returningUserForm = useForm<ReturningUserFormValues>({
    resolver: zodResolver(returningUserSchema),
    defaultValues: {
      email: "",
      phone: "",
    },
  })

  // Handle new user registration
  const onNewUserSubmit = async (data: NewUserFormValues) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          levelId,
          gameStats,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to register")
      }

      console.log("Saving userId: " + result.userId)

      // Save user ID to local storage
      localStorage.setItem("userId", result.userId)
      localStorage.setItem("userName", data.name)
      


      // Download the PDF if this is for claiming a gift
      if (levelId) {
        downloadGift(levelId)
      }

      toast({
        title: "Success!",
        description: "Your information has been saved.",
      })

      onSuccess(result.userId, data.name);
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to register. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle returning user login
  const onReturningUserSubmit = async (data: ReturningUserFormValues) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          phone: data.phone,
          gameStats,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to login")
      }

      // Save user ID to local storage
      localStorage.setItem("userId", result.userId)
      localStorage.setItem("userName", result.userName || "")

      toast({
        title: "Welcome back!",
        description: "Your progress has been loaded.",
      })

      onSuccess(result.userId, result.userName);
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to login. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to download the gift PDF
  const downloadGift = async (levelId: number) => {
    try {
      const response = await fetch(`/api/gifts/download?levelId=${levelId}`, {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error("Failed to download gift")
      }

      // Create a blob from the PDF stream
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      // Create a link and trigger the download
      const a = document.createElement("a")
      a.href = url
      a.download = `german-level-${levelId}-certificate.pdf`
      document.body.appendChild(a)
      a.click()

      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Gift downloaded!",
        description: "Your certificate has been downloaded.",
      })

      // Try to open the PDF in a new tab
      window.open(url, "_blank")
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Download Error",
        description: "Failed to download your gift. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[350px] md:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {showNewUserForm ? "Claim Your Gift!" : "Welcome Back to German Learning!"}
          </DialogTitle>
          <DialogDescription>
            {showNewUserForm
              ? "Enter your details to receive a personalized PDF on German noun genders and save your progress."
              : "Enter your details to continue your German learning journey."}
          </DialogDescription>
        </DialogHeader>

        {showNewUserForm ? (
          <Form {...newUserForm}>
            <form onSubmit={newUserForm.handleSubmit(onNewUserSubmit)} className="space-y-4">
              <FormField
                control={newUserForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={newUserForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={newUserForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+237 " {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Get My Gift
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <Form {...returningUserForm}>
            <form onSubmit={returningUserForm.handleSubmit(onReturningUserSubmit)} className="space-y-4">
              <FormField
                control={returningUserForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={returningUserForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+237" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Continue Learning"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        <div className="text-center text-sm text-gray-500 mt-2">
          <p>
            {showNewUserForm
              ? "Your information helps us personalize your learning experience and provide you with relevant German learning resources."
              : "Welcome back! Your progress will be loaded automatically."}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

