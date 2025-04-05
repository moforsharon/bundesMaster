// "use client"

// import { useState, useEffect } from "react"
// import { z } from "zod"
// import { useForm } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { useToast } from "@/hooks/use-toast"
// import { Download, Loader2 } from "lucide-react"
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
// import { useRouter } from "next/navigation"
// import { useDictionary } from "@/hooks/use-dictionary"



// interface UserLoginModalProps {
//   isOpen: boolean
//   onClose: () => void
//   onSuccess: (userId: string, name?: string, challengeData?: any) => void;
//   isNewUser: boolean
//   challengeLevel: number
//   setActiveStep?: (step: string) => void;  
// }

// export default function UserLoginModal({
//   isOpen,
//   onClose,
//   onSuccess,
//   isNewUser,
//   challengeLevel = 1,
//   setActiveStep,
// }: UserLoginModalProps) {
//   const { dict } = useDictionary()


//   // Define the form schema with validation
//   const newUserSchema = z.object({
//     name: z.string().min(2, { message: dict.errors.nameMinLength }),
//     email: z.string().email({ message: dict.errors.emailInvalid }),
//     phone: z
//       .string()
//       .min(9, { message: dict.errors.phoneInvalid })
//       .regex(/^(\+237|237)?[5-9]\d{8}$/, { message: dict.errors.phoneCameroon }),
//   })

//   const returningUserSchema = z.object({
//     email: z.string().email({ message: dict.errors.emailInvalid }),
//     phone: z
//       .string()
//       .min(9, { message: dict.errors.phoneInvalid })
//       .regex(/^(\+237|237)?[5-9]\d{8}$/, { message: dict.errors.phoneCameroon }),
//   })

//   type NewUserFormValues = z.infer<typeof newUserSchema>
//   type ReturningUserFormValues = z.infer<typeof returningUserSchema>
//   const [isLoading, setIsLoading] = useState(false)
//   const { toast } = useToast()
//   const router = useRouter()
  
//   // Add state to control which form is shown, initialized based on isNewUser
//   const [showNewUserForm, setShowNewUserForm] = useState(isNewUser)

//   // Reset form view when isNewUser changes
//   useEffect(() => {
//     setShowNewUserForm(isNewUser)
//   }, [isNewUser])

//   // Setup form for new users
//   const newUserForm = useForm<NewUserFormValues>({
//     resolver: zodResolver(newUserSchema),
//     defaultValues: {
//       name: "",
//       email: "",
//       phone: "",
//     },
//   })

//   const returningUserForm = useForm<ReturningUserFormValues>({
//     resolver: zodResolver(returningUserSchema),
//     defaultValues: {
//       email: "",
//       phone: "",
//     },
//   })

//   // Handle new user registration
//   const onNewUserSubmit = async (data: NewUserFormValues) => {
//     setIsLoading(true)
//     try {
//       const response = await fetch("/api/challenge-users/register", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name: data.name,
//           email: data.email,
//           phone: data.phone,
//           challengeLevel,
//         }),
//       })

//       const result = await response.json()

//       if (!response.ok) {
//         throw new Error(result.message || "Failed to register for challenge")
//       }

//       // Save user data to local storage
//       localStorage.setItem("userId", result.user.id)
//       localStorage.setItem("userName", result.user.name)
//       localStorage.setItem("challengeLevel", result.challengeInfo.challengeLevel)
//       localStorage.setItem("participantId", result.challengeInfo.participantId)

//       toast({
//         title: "Challenge Registration Successful!",
//         description: "You've been registered for the challenge.",
//       })

//       // Call onSuccess with all the challenge data
//       onSuccess(
//         result.user.id, 
//         result.user.name,
//         {
//           challengeInfo: result.challengeInfo,
//           progress: result.progress
//         }
//       )
      
//       // Redirect to challenge page
//       // Redirect to challenge page
//       if (setActiveStep) {
//         setActiveStep("challenge")
//       } else {
//         router.push(`/challenges/level-${result.challengeInfo.challengeLevel}`)
//       }
      
//     } catch (error) {
//       console.error("Registration error:", error)
//       toast({
//         title: "Error",
//         description: error instanceof Error ? error.message : "Failed to register. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   // Handle returning user login
//   const onReturningUserSubmit = async (data: ReturningUserFormValues) => {
//     setIsLoading(true)
//     try {
//       const response = await fetch("/api/challenge-users/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: data.email,
//           phone: data.phone,
//         }),
//       })

//       const result = await response.json()

//       if (!response.ok) {
//         throw new Error(result.message || "Failed to login to challenge")
//       }

//       // Save user data to local storage
//       localStorage.setItem("userId", result.user.id)
//       localStorage.setItem("userName", result.user.name)
//       localStorage.setItem("challengeLevel", result.challengeInfo.challengeLevel)
//       localStorage.setItem("participantId", result.challengeInfo.participantId)

//       toast({
//         title: "Welcome back!",
//         description: "Your challenge progress has been loaded.",
//       })

//       // Call onSuccess with all the challenge data
//       onSuccess(
//         result.user.id, 
//         result.user.name,
//         {
//           challengeInfo: result.challengeInfo,
//           progress: result.progress
//         }
//       )
      
//       // Redirect to challenge page
//       if (setActiveStep) {
//         setActiveStep("challenge")
//       } else {
//         router.push(`/challenges/level-${result.challengeInfo.challengeLevel}`)
//       }
//       returningUserForm.reset();
//     } catch (error) {
//       console.error("Login error:", error)
//       toast({
//         title: "Error",
//         description: error instanceof Error ? error.message : "Failed to login. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={(newOpen) => {
//         if (!newOpen) {
//             returningUserForm.reset();
//             onClose();
//         }
//     }}>
//       <DialogContent className="max-w-[350px] md:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle>
//             {showNewUserForm ? "Join the Challenge!" : "Welcome Back!"}
//           </DialogTitle>
//           <DialogDescription>
//             {showNewUserForm
//               ? "Register to participate in this exciting challenge."
//               : "Sign in to continue your participation in this challenge."}
//           </DialogDescription>
//         </DialogHeader>

//         {showNewUserForm ? (
//           <Form {...newUserForm}>
//             <form onSubmit={newUserForm.handleSubmit(onNewUserSubmit)} className="space-y-4">
//               <FormField
//                 control={newUserForm.control}
//                 name="name"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Name</FormLabel>
//                     <FormControl>
//                       <Input placeholder="Your name" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={newUserForm.control}
//                 name="email"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Email</FormLabel>
//                     <FormControl>
//                       <Input type="email" placeholder="your.email@example.com" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={newUserForm.control}
//                 name="phone"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Phone Number</FormLabel>
//                     <FormControl>
//                       <Input placeholder="+237 " {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <DialogFooter>
//                 <Button type="submit" disabled={isLoading} className="w-full">
//                   {isLoading ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       Registering...
//                     </>
//                   ) : (
//                     "Join Challenge"
//                   )}
//                 </Button>
//               </DialogFooter>
//             </form>
//           </Form>
//         ) : (
//           <Form {...returningUserForm}>
//             <form onSubmit={returningUserForm.handleSubmit(onReturningUserSubmit)} className="space-y-4">
//               <FormField
//                 control={returningUserForm.control}
//                 name="email"
//                 render={({ field }) => {
//                   console.log("Email field:", field); // Inspect the field object
//                   return (
//                       <FormItem>
//                           <FormLabel>Email</FormLabel>
//                           <FormControl>
//                               <Input type="email" placeholder="your.email@example.com" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                       </FormItem>
//                   );
//               }}
//               />

//               <FormField
//                 control={returningUserForm.control}
//                 name="phone"
//                 render={({ field }) => {
//                   console.log("phone number field:", field);
//                   return (
//                   <FormItem>
//                     <FormLabel>Phone Number</FormLabel>
//                     <FormControl>
//                       <Input placeholder="+237" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                   );
//                 }}
//               />

//               <DialogFooter>
//                 <Button type="submit" disabled={isLoading} className="w-full">
//                   {isLoading ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       Loading...
//                     </>
//                   ) : (
//                     "Continue Learning"
//                   )}
//                 </Button>
//               </DialogFooter>
//             </form>
//           </Form>
//         )}

//         <div className="text-center text-sm text-gray-500 mt-2">
//           <p>
//             {showNewUserForm
//               ? "Already have an account? "
//               : ""}
//           </p>
//           {showNewUserForm && <button className="text-blue" onClick={() => setShowNewUserForm(false)}>Click here to Login</button>}
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// }

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
import { Loader2 } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useRouter } from "next/navigation"
import { useDictionary } from "@/hooks/use-dictionary"

interface UserLoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (userId: string, name?: string, challengeData?: any) => void
  isNewUser: boolean
  challengeLevel: number
  setActiveStep?: (step: string) => void
}

export default function UserLoginModal({
  isOpen,
  onClose,
  onSuccess,
  isNewUser,
  challengeLevel = 1,
  setActiveStep,
}: UserLoginModalProps) {
  const { dict } = useDictionary()

  // Define the form schema with validation
  const newUserSchema = z.object({
    name: z.string().min(2, { message: dict?.errors.nameMinLength }),
    email: z.string().email({ message: dict?.errors.emailInvalid }),
    phone: z
      .string()
      .min(9, { message: dict?.errors.phoneInvalid })
      .regex(/^(\+237|237)?[5-9]\d{8}$/, { message: dict?.errors.phoneCameroon }),
  })

  const returningUserSchema = z.object({
    email: z.string().email({ message: dict?.errors.emailInvalid }),
    phone: z
      .string()
      .min(9, { message: dict?.errors.phoneInvalid })
      .regex(/^(\+237|237)?[5-9]\d{8}$/, { message: dict?.errors.phoneCameroon }),
  })

  type NewUserFormValues = z.infer<typeof newUserSchema>
  type ReturningUserFormValues = z.infer<typeof returningUserSchema>
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

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
      const response = await fetch("/api/challenge-users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          challengeLevel,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to register for challenge")
      }

      // Save user data to local storage
      localStorage.setItem("userId", result.user.id)
      localStorage.setItem("userName", result.user.name)
      localStorage.setItem("challengeLevel", result.challengeInfo.challengeLevel)
      localStorage.setItem("participantId", result.challengeInfo.participantId)

      toast({
        title: "Challenge Registration Successful!",
        description: "You've been registered for the challenge.",
      })

      // Call onSuccess with all the challenge data
      onSuccess(result.user.id, result.user.name, {
        challengeInfo: result.challengeInfo,
        progress: result.progress,
      })

      // Redirect to challenge page
      // Redirect to challenge page
      if (setActiveStep) {
        setActiveStep("challenge")
      } else {
        router.push(`/challenges/level-${result.challengeInfo.challengeLevel}`)
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : dict?.errors.registrationFailed,
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
      const response = await fetch("/api/challenge-users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          phone: data.phone,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to login to challenge")
      }

      // Save user data to local storage
      localStorage.setItem("userId", result.user.id)
      localStorage.setItem("userName", result.user.name)
      localStorage.setItem("challengeLevel", result.challengeInfo.challengeLevel)
      localStorage.setItem("participantId", result.challengeInfo.participantId)

      toast({
        title: "Welcome back!",
        description: "Your challenge progress has been loaded.",
      })

      // Call onSuccess with all the challenge data
      onSuccess(result.user.id, result.user.name, {
        challengeInfo: result.challengeInfo,
        progress: result.progress,
      })

      // Redirect to challenge page
      if (setActiveStep) {
        setActiveStep("challenge")
      } else {
        router.push(`/challenges/level-${result.challengeInfo.challengeLevel}`)
      }
      returningUserForm.reset()
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : dict?.errors.loginFailed,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          returningUserForm.reset()
          onClose()
        }
      }}
    >
      <DialogContent className="max-w-[350px] md:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{showNewUserForm ? dict?.login.joinChallenge : dict?.login.welcomeBack}</DialogTitle>
          <DialogDescription>
            {showNewUserForm ? dict?.login.registerDescription : dict?.login.loginDescription}
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
                    <FormLabel>{dict?.game.userRegistration.name}</FormLabel>
                    <FormControl>
                      <Input placeholder={dict?.form.placeholders.name} {...field} />
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
                    <FormLabel>{dict?.game.userRegistration.email}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={dict?.form.placeholders.email} {...field} />
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
                    <FormLabel>{dict?.game.userRegistration.phone}</FormLabel>
                    <FormControl>
                      <Input placeholder={dict?.form.placeholders.phone} {...field} />
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
                      {dict?.game.userRegistration.processing}
                    </>
                  ) : (
                    dict?.game.userRegistration.getGift
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
                render={({ field }) => {
                  console.log("Email field:", field) // Inspect the field object
                  return (
                    <FormItem>
                      <FormLabel>{dict?.game.userRegistration.email}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder={dict?.form.placeholders.email} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />

              <FormField
                control={returningUserForm.control}
                name="phone"
                render={({ field }) => {
                  console.log("phone number field:", field)
                  return (
                    <FormItem>
                      <FormLabel>{dict?.game.userRegistration.phone}</FormLabel>
                      <FormControl>
                        <Input placeholder={dict?.form.placeholders.phone} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />

              <DialogFooter>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {dict?.game.userRegistration.processing}
                    </>
                  ) : (
                    dict?.game.userRegistration.continueLearning
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        <div className="text-center text-sm text-gray-500 mt-2">
          <p>{showNewUserForm ? dict?.login.alreadyAccount : ""}</p>
          {showNewUserForm && (
            <button className="text-blue" onClick={() => setShowNewUserForm(false)}>
              {dict?.login.clickToLogin}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

