// "use client"

// import type React from "react"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { useToast } from "@/hooks/use-toast"
// import { CalendarIcon, PlusCircle, RefreshCw, Trash2 } from "lucide-react"
// import { format } from "date-fns"
// import { Calendar } from "@/components/ui/calendar"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { cn } from "@/lib/utils"

// type Challenge = {
//   id?: number
//   title: string
//   description: string
//   start_date: string
//   end_date: string
//   rules: string
//   prize_description: string
// }

// export default function ChallengesAdmin() {
//   const [challenges, setChallenges] = useState<Challenge[]>([])
//   const [loading, setLoading] = useState(true)
//   const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
//   const { toast } = useToast()
//   const router = useRouter()

//   // Form state for new challenge
//   const [newChallenge, setNewChallenge] = useState<Challenge>({
//     title: "",
//     description: "",
//     start_date: isValidDate(new Date()) ? new Date().toISOString() : "",
//     end_date: isValidDate(new Date()) ? new Date().toISOString() : "",
//     rules: "",
//     prize_description: "",
//   })
  
//   // Helper function
//   function isValidDate(date: Date) {
//     return !isNaN(date.getTime())
//   }

//   // Load challenges on mount
//   useEffect(() => {
//     fetchChallenges()
//   }, [])

//   const fetchChallenges = async () => {
//     setLoading(true)
//     try {
//       const response = await fetch("/api/challenges")
//       if (!response.ok) throw new Error("Failed to fetch challenges")
//       const data = await response.json()
//       setChallenges(data)
//     } catch (error) {
//       console.error("Error fetching challenges:", error)
//       toast({
//         title: "Error",
//         description: "Failed to load challenges. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleCreateChallenge = async (e: React.FormEvent) => {
//     e.preventDefault()
//     try {
//       const response = await fetch("/api/challenges", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(newChallenge),
//       })

//       if (!response.ok) throw new Error("Failed to create challenge")

//       const data = await response.json()
//       toast({
//         title: "Success",
//         description: "Challenge created successfully!",
//       })

//       // Reset form and refresh challenges
//       setNewChallenge({
//         title: "",
//         description: "",
//         start_date: new Date().toISOString(),
//         end_date: new Date().toISOString(),
//         rules: "",
//         prize_description: "",
//       })
//       fetchChallenges()
//     } catch (error) {
//       console.error("Error creating challenge:", error)
//       toast({
//         title: "Error",
//         description: "Failed to create challenge. Please try again.",
//         variant: "destructive",
//       })
//     }
//   }

//   const handleUpdateChallenge = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!selectedChallenge || !selectedChallenge.id) return

//     try {
//       const response = await fetch(`/api/challenges/${selectedChallenge.id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(selectedChallenge),
//       })

//       if (!response.ok) throw new Error("Failed to update challenge")

//       toast({
//         title: "Success",
//         description: "Challenge updated successfully!",
//       })

//       // Refresh challenges
//       fetchChallenges()
//     } catch (error) {
//       console.error("Error updating challenge:", error)
//       toast({
//         title: "Error",
//         description: "Failed to update challenge. Please try again.",
//         variant: "destructive",
//       })
//     }
//   }

//   const handleDeleteChallenge = async (id: number) => {
//     if (!confirm("Are you sure you want to delete this challenge?")) return

//     try {
//       const response = await fetch(`/api/challenges/${id}`, {
//         method: "DELETE",
//       })

//       if (!response.ok) throw new Error("Failed to delete challenge")

//       toast({
//         title: "Success",
//         description: "Challenge deleted successfully!",
//       })

//       // Refresh challenges
//       fetchChallenges()
//       if (selectedChallenge?.id === id) {
//         setSelectedChallenge(null)
//       }
//     } catch (error) {
//       console.error("Error deleting challenge:", error)
//       toast({
//         title: "Error",
//         description: "Failed to delete challenge. Please try again.",
//         variant: "destructive",
//       })
//     }
//   }

//   const formatDate = (dateString: string) => {
//     try {
//       const date = new Date(dateString)
//       if (isNaN(date.getTime())) {
//         return "Invalid date"
//       }
//       return format(date, "PPP p")
//     } catch (e) {
//       console.error("Error formatting date:", e)
//       return "Invalid date"
//     }
//   }

//   const getTimeValue = (dateString: string) => {
//     try {
//       const date = new Date(dateString)
//       if (isNaN(date.getTime())) {
//         return "00:00" // Default value if date is invalid
//       }
//       return format(date, "HH:mm")
//     } catch (e) {
//       console.error("Error formatting time:", e)
//       return "00:00"
//     }
//   }

//   return (
//     <div className="container mx-auto py-8">
//       <h1 className="text-3xl font-bold mb-8">Challenge Administration</h1>

//       <Tabs defaultValue="list">
//         <TabsList className="mb-6">
//           <TabsTrigger value="list">Challenge List</TabsTrigger>
//           <TabsTrigger value="create">Create Challenge</TabsTrigger>
//           {selectedChallenge && <TabsTrigger value="edit">Edit Challenge</TabsTrigger>}
//         </TabsList>

//         <TabsContent value="list">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-xl font-semibold">All Challenges</h2>
//             <Button onClick={fetchChallenges} variant="outline" size="sm">
//               <RefreshCw className="h-4 w-4 mr-2" />
//               Refresh
//             </Button>
//           </div>

//           {loading ? (
//             <div className="flex justify-center py-8">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//             </div>
//           ) : challenges.length === 0 ? (
//             <Card>
//               <CardContent className="py-8 text-center">
//                 <p className="text-muted-foreground">No challenges found. Create your first challenge!</p>
//               </CardContent>
//             </Card>
//           ) : (
//             <div className="grid gap-4 md:grid-cols-2">
//               {challenges.map((challenge) => (
//                 <Card key={challenge.id} className="overflow-hidden">
//                   <CardHeader>
//                     <CardTitle>{challenge.title}</CardTitle>
//                     <CardDescription>
//                       {formatDate(challenge.start_date)} - {formatDate(challenge.end_date)}
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <p className="text-sm line-clamp-2 mb-2">{challenge.description}</p>
//                   </CardContent>
//                   <CardFooter className="bg-muted/50 flex justify-between">
//                     <Button variant="outline" size="sm" onClick={() => setSelectedChallenge(challenge)}>
//                       Edit
//                     </Button>
//                     <Button
//                       variant="destructive"
//                       size="sm"
//                       onClick={() => challenge.id && handleDeleteChallenge(challenge.id)}
//                     >
//                       <Trash2 className="h-4 w-4 mr-1" />
//                       Delete
//                     </Button>
//                   </CardFooter>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </TabsContent>

//         <TabsContent value="create">
//           <Card>
//             <CardHeader>
//               <CardTitle>Create New Challenge</CardTitle>
//               <CardDescription>Fill out the form below to create a new challenge</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <form onSubmit={handleCreateChallenge} className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="title">Title</Label>
//                   <Input
//                     id="title"
//                     value={newChallenge.title}
//                     onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
//                     required
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="description">Description</Label>
//                   <Textarea
//                     id="description"
//                     value={newChallenge.description}
//                     onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
//                     rows={3}
//                   />
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label>Start Date & Time</Label>
//                     <div className="flex">
//                       <Popover>
//                         <PopoverTrigger asChild>
//                           <Button
//                             variant="outline"
//                             className={cn(
//                               "w-full justify-start text-left font-normal",
//                               !newChallenge.start_date && "text-muted-foreground",
//                             )}
//                           >
//                             <CalendarIcon className="mr-2 h-4 w-4" />
//                             {newChallenge.start_date ? (
//                               format(new Date(newChallenge.start_date), "PPP")
//                             ) : (
//                               <span>Pick a date</span>
//                             )}
//                           </Button>
//                         </PopoverTrigger>
//                         <PopoverContent className="w-auto p-0">
//                           <Calendar
//                             mode="single"
//                             selected={new Date(newChallenge.start_date)}
//                             onSelect={(date) =>
//                               date &&
//                               setNewChallenge({
//                                 ...newChallenge,
//                                 start_date: date.toISOString(),
//                               })
//                             }
//                           />
//                         </PopoverContent>
//                       </Popover>
//                       <Input
//                         type="time"
//                         className="ml-2 w-24"
//                         value={getTimeValue(newChallenge.start_date)}
//                         onChange={(e) => {
//                             const [hours, minutes] = e.target.value.split(":")
//                             const date = new Date(newChallenge.start_date)
//                             if (!isNaN(date.getTime())) {
//                             date.setHours(Number.parseInt(hours), Number.parseInt(minutes))
//                             setNewChallenge({ ...newChallenge, start_date: date.toISOString() })
//                             }
//                         }}
//                         />
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <Label>End Date & Time</Label>
//                     <div className="flex">
//                       <Popover>
//                         <PopoverTrigger asChild>
//                           <Button
//                             variant="outline"
//                             className={cn(
//                               "w-full justify-start text-left font-normal",
//                               !newChallenge.end_date && "text-muted-foreground",
//                             )}
//                           >
//                             <CalendarIcon className="mr-2 h-4 w-4" />
//                             {newChallenge.end_date ? (
//                               format(new Date(newChallenge.end_date), "PPP")
//                             ) : (
//                               <span>Pick a date</span>
//                             )}
//                           </Button>
//                         </PopoverTrigger>
//                         <PopoverContent className="w-auto p-0">
//                           <Calendar
//                             mode="single"
//                             selected={new Date(newChallenge.end_date)}
//                             onSelect={(date) =>
//                               date &&
//                               setNewChallenge({
//                                 ...newChallenge,
//                                 end_date: date.toISOString(),
//                               })
//                             }
//                           />
//                         </PopoverContent>
//                       </Popover>
//                       <Input
//                         type="time"
//                         className="ml-2 w-24"
//                         value={getTimeValue(newChallenge.end_date)}
//                         onChange={(e) => {
//                             const [hours, minutes] = e.target.value.split(":")
//                             const date = new Date(newChallenge.end_date)
//                             if (!isNaN(date.getTime())) {
//                             date.setHours(Number.parseInt(hours), Number.parseInt(minutes))
//                             setNewChallenge({ ...newChallenge, end_date: date.toISOString() })
//                             }
//                         }}
//                         />
//                     </div>
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="rules">Rules</Label>
//                   <Textarea
//                     id="rules"
//                     value={newChallenge.rules}
//                     onChange={(e) => setNewChallenge({ ...newChallenge, rules: e.target.value })}
//                     rows={3}
//                     placeholder="Enter challenge rules, one per line"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="prize_description">Prize Description</Label>
//                   <Textarea
//                     id="prize_description"
//                     value={newChallenge.prize_description}
//                     onChange={(e) => setNewChallenge({ ...newChallenge, prize_description: e.target.value })}
//                     rows={2}
//                   />
//                 </div>

//                 <Button type="submit" className="w-full">
//                   <PlusCircle className="h-4 w-4 mr-2" />
//                   Create Challenge
//                 </Button>
//               </form>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {selectedChallenge && (
//           <TabsContent value="edit">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Edit Challenge</CardTitle>
//                 <CardDescription>Update the challenge details</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <form onSubmit={handleUpdateChallenge} className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="edit-title">Title</Label>
//                     <Input
//                       id="edit-title"
//                       value={selectedChallenge.title}
//                       onChange={(e) => setSelectedChallenge({ ...selectedChallenge, title: e.target.value })}
//                       required
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="edit-description">Description</Label>
//                     <Textarea
//                       id="edit-description"
//                       value={selectedChallenge.description}
//                       onChange={(e) => setSelectedChallenge({ ...selectedChallenge, description: e.target.value })}
//                       rows={3}
//                     />
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label>Start Date & Time</Label>
//                       <div className="flex">
//                         <Popover>
//                           <PopoverTrigger asChild>
//                             <Button
//                               variant="outline"
//                               className={cn(
//                                 "w-full justify-start text-left font-normal",
//                                 !selectedChallenge.start_date && "text-muted-foreground",
//                               )}
//                             >
//                               <CalendarIcon className="mr-2 h-4 w-4" />
//                               {selectedChallenge.start_date ? (
//                                 format(new Date(selectedChallenge.start_date), "PPP")
//                               ) : (
//                                 <span>Pick a date</span>
//                               )}
//                             </Button>
//                           </PopoverTrigger>
//                           <PopoverContent className="w-auto p-0">
//                             <Calendar
//                               mode="single"
//                               selected={new Date(selectedChallenge.start_date)}
//                               onSelect={(date) =>
//                                 date &&
//                                 setSelectedChallenge({
//                                   ...selectedChallenge,
//                                   start_date: date.toISOString(),
//                                 })
//                               }
//                             />
//                           </PopoverContent>
//                         </Popover>
//                         <Input
//                             type="time"
//                             className="ml-2 w-24"
//                             value={getTimeValue(selectedChallenge.start_date)}
//                             onChange={(e) => {
//                                 const [hours, minutes] = e.target.value.split(":")
//                                 const date = new Date(selectedChallenge.start_date)
//                                 if (!isNaN(date.getTime())) {
//                                 date.setHours(Number.parseInt(hours), Number.parseInt(minutes))
//                                 setSelectedChallenge({ ...selectedChallenge, start_date: date.toISOString() })
//                                 }
//                             }}
//                             />
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <Label>End Date & Time</Label>
//                       <div className="flex">
//                         <Popover>
//                           <PopoverTrigger asChild>
//                             <Button
//                               variant="outline"
//                               className={cn(
//                                 "w-full justify-start text-left font-normal",
//                                 !selectedChallenge.end_date && "text-muted-foreground",
//                               )}
//                             >
//                               <CalendarIcon className="mr-2 h-4 w-4" />
//                               {selectedChallenge.end_date ? (
//                                 format(new Date(selectedChallenge.end_date), "PPP")
//                               ) : (
//                                 <span>Pick a date</span>
//                               )}
//                             </Button>
//                           </PopoverTrigger>
//                           <PopoverContent className="w-auto p-0">
//                             <Calendar
//                               mode="single"
//                               selected={new Date(selectedChallenge.end_date)}
//                               onSelect={(date) =>
//                                 date &&
//                                 setSelectedChallenge({
//                                   ...selectedChallenge,
//                                   end_date: date.toISOString(),
//                                 })
//                               }
//                             />
//                           </PopoverContent>
//                         </Popover>
//                         <Input
//                             type="time"
//                             className="ml-2 w-24"
//                             value={getTimeValue(selectedChallenge.end_date)}
//                             onChange={(e) => {
//                                 const [hours, minutes] = e.target.value.split(":")
//                                 const date = new Date(selectedChallenge.end_date)
//                                 if (!isNaN(date.getTime())) {
//                                 date.setHours(Number.parseInt(hours), Number.parseInt(minutes))
//                                 setSelectedChallenge({ ...selectedChallenge, end_date: date.toISOString() })
//                                 }
//                             }}
//                             />
//                       </div>
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="edit-rules">Rules</Label>
//                     <Textarea
//                       id="edit-rules"
//                       value={selectedChallenge.rules}
//                       onChange={(e) => setSelectedChallenge({ ...selectedChallenge, rules: e.target.value })}
//                       rows={3}
//                       placeholder="Enter challenge rules, one per line"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="edit-prize_description">Prize Description</Label>
//                     <Textarea
//                       id="edit-prize_description"
//                       value={selectedChallenge.prize_description}
//                       onChange={(e) =>
//                         setSelectedChallenge({ ...selectedChallenge, prize_description: e.target.value })
//                       }
//                       rows={2}
//                     />
//                   </div>

//                   <div className="flex justify-between">
//                     <Button
//                       type="button"
//                       variant="destructive"
//                       onClick={() => selectedChallenge.id && handleDeleteChallenge(selectedChallenge.id)}
//                     >
//                       <Trash2 className="h-4 w-4 mr-2" />
//                       Delete Challenge
//                     </Button>
//                     <Button type="submit">Save Changes</Button>
//                   </div>
//                 </form>
//               </CardContent>
//             </Card>
//           </TabsContent>
//         )}
//       </Tabs>
//     </div>
//   )
// }

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { CalendarIcon, PlusCircle, RefreshCw, Trash2, Users, Trophy, Search } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Challenge = {
  id?: number
  title: string
  description: string
  start_date: string
  end_date: string
  rules: string
  prize_description: string
}

type User = {
  id: number
  name: string
  email: string
  phone: string
}

type ChallengeUser = {
  id: number
  name: string
  email: string
  phone: string
  final_score?: number
  time_in_seconds?: number
}

export default function AdminInterface() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [challengeUsers, setChallengeUsers] = useState<ChallengeUser[]>([])
  const [loading, setLoading] = useState({
    challenges: true,
    users: true,
    challengeUsers: true,
  })
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [mainTab, setMainTab] = useState("challenges")
  const [userSearchQuery, setUserSearchQuery] = useState("")
  const [challengeUserSearchQuery, setChallengeUserSearchQuery] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  // Form state for new challenge
  const [newChallenge, setNewChallenge] = useState<Challenge>({
    title: "",
    description: "",
    start_date: isValidDate(new Date()) ? new Date().toISOString() : "",
    end_date: isValidDate(new Date()) ? new Date().toISOString() : "",
    rules: "",
    prize_description: "",
  })

  // Helper function
  function isValidDate(date: Date) {
    return !isNaN(date.getTime())
  }

  // Load data on mount
  useEffect(() => {
    fetchChallenges()
    fetchUsers()
    fetchChallengeUsers()
  }, [])

  const fetchChallenges = async () => {
    setLoading((prev) => ({ ...prev, challenges: true }))
    try {
      const response = await fetch("/api/challenges")
      if (!response.ok) throw new Error("Failed to fetch challenges")
      const data = await response.json()
      setChallenges(data)
    } catch (error) {
      console.error("Error fetching challenges:", error)
      toast({
        title: "Error",
        description: "Failed to load challenges. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading((prev) => ({ ...prev, challenges: false }))
    }
  }

  const fetchUsers = async () => {
    setLoading((prev) => ({ ...prev, users: true }))
    try {
      const response = await fetch("/api/users/getAllUsers")
      if (!response.ok) throw new Error("Failed to fetch users")
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading((prev) => ({ ...prev, users: false }))
    }
  }

  const fetchChallengeUsers = async () => {
    setLoading((prev) => ({ ...prev, challengeUsers: true }))
    try {
      // Fetch challenge users with their final scores
      const response = await fetch("/api/challenge-users/getAllUsers")
      if (!response.ok) throw new Error("Failed to fetch challenge users")
      const data = await response.json()
      setChallengeUsers(data)
    } catch (error) {
      console.error("Error fetching challenge users:", error)
      toast({
        title: "Error",
        description: "Failed to load challenge users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading((prev) => ({ ...prev, challengeUsers: false }))
    }
  }

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/challenges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newChallenge),
      })

      if (!response.ok) throw new Error("Failed to create challenge")

      const data = await response.json()
      toast({
        title: "Success",
        description: "Challenge created successfully!",
      })

      // Reset form and refresh challenges
      setNewChallenge({
        title: "",
        description: "",
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
        rules: "",
        prize_description: "",
      })
      fetchChallenges()
    } catch (error) {
      console.error("Error creating challenge:", error)
      toast({
        title: "Error",
        description: "Failed to create challenge. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateChallenge = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedChallenge || !selectedChallenge.id) return

    try {
      const response = await fetch(`/api/challenges/${selectedChallenge.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedChallenge),
      })

      if (!response.ok) throw new Error("Failed to update challenge")

      toast({
        title: "Success",
        description: "Challenge updated successfully!",
      })

      // Refresh challenges
      fetchChallenges()
    } catch (error) {
      console.error("Error updating challenge:", error)
      toast({
        title: "Error",
        description: "Failed to update challenge. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteChallenge = async (id: number) => {
    if (!confirm("Are you sure you want to delete this challenge?")) return

    try {
      const response = await fetch(`/api/challenges/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete challenge")

      toast({
        title: "Success",
        description: "Challenge deleted successfully!",
      })

      // Refresh challenges
      fetchChallenges()
      if (selectedChallenge?.id === id) {
        setSelectedChallenge(null)
      }
    } catch (error) {
      console.error("Error deleting challenge:", error)
      toast({
        title: "Error",
        description: "Failed to delete challenge. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Invalid date"
      }
      return format(date, "PPP p")
    } catch (e) {
      console.error("Error formatting date:", e)
      return "Invalid date"
    }
  }

  const getTimeValue = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "00:00" // Default value if date is invalid
      }
      return format(date, "HH:mm")
    } catch (e) {
      console.error("Error formatting time:", e)
      return "00:00"
    }
  }

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.phone.includes(userSearchQuery),
  )

  // Filter challenge users based on search query
  const filteredChallengeUsers = challengeUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(challengeUserSearchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(challengeUserSearchQuery.toLowerCase()) ||
      user.phone.includes(challengeUserSearchQuery),
  )

  return (
    <div className="flex h-screen">
      {/* Side Panel */}
      <div className="w-64 border-r bg-muted/40 p-4">
        <h1 className="text-xl font-bold mb-6 mt-10">Admin Dashboard</h1>
        <div className="space-y-2">
          <button
            className={`flex items-center w-full p-2 rounded-md ${mainTab === "users" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            onClick={() => setMainTab("users")}
          >
            <Users className="mr-2 h-5 w-5" />
            Users
          </button>
          <button
            className={`flex items-center w-full p-2 rounded-md ${mainTab === "challenges" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            onClick={() => setMainTab("challenges")}
          >
            <Trophy className="mr-2 h-5 w-5" />
            Challenges
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {mainTab === "users" && (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Users</h1>

            <Tabs defaultValue="normal-users" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="normal-users">Normal Users</TabsTrigger>
                <TabsTrigger value="challenge-users">Challenge Users</TabsTrigger>
              </TabsList>

              <TabsContent value="normal-users">
                <div className="mb-4 flex items-center">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search users..."
                      className="pl-8"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button onClick={fetchUsers} variant="outline" size="sm" className="ml-2">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone Number</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading.users ? (
                        <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center">
                            <div className="flex justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center">
                            No users found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.phone}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="challenge-users">
                <div className="mb-4 flex items-center">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search challenge users..."
                      className="pl-8"
                      value={challengeUserSearchQuery}
                      onChange={(e) => setChallengeUserSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button onClick={fetchChallengeUsers} variant="outline" size="sm" className="ml-2">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone Number</TableHead>
                        <TableHead>Final Score</TableHead>
                        <TableHead>Completion Time (in seconds)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading.challengeUsers ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            <div className="flex justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredChallengeUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            No challenge users found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredChallengeUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.phone}</TableCell>
                            <TableCell>{user.final_score !== undefined ? user.final_score : "N/A"}</TableCell>
                            <TableCell>{user.time_in_seconds !== undefined ? user.time_in_seconds : "N/A"}s</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {mainTab === "challenges" && (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Challenge Management</h1>

            <Tabs defaultValue="list">
              <TabsList className="mb-6">
                <TabsTrigger value="list">Challenge List</TabsTrigger>
                <TabsTrigger value="create">Create Challenge</TabsTrigger>
                {selectedChallenge && <TabsTrigger value="edit">Edit Challenge</TabsTrigger>}
              </TabsList>

              <TabsContent value="list">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">All Challenges</h2>
                  <Button onClick={fetchChallenges} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                {loading.challenges ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : challenges.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground">No challenges found. Create your first challenge!</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {challenges.map((challenge) => (
                      <Card key={challenge.id} className="overflow-hidden">
                        <CardHeader>
                          <CardTitle>{challenge.title}</CardTitle>
                          <CardDescription>
                            {formatDate(challenge.start_date)} - {formatDate(challenge.end_date)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm line-clamp-2 mb-2">{challenge.description}</p>
                        </CardContent>
                        <CardFooter className="bg-muted/50 flex justify-between">
                          <Button variant="outline" size="sm" onClick={() => setSelectedChallenge(challenge)}>
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => challenge.id && handleDeleteChallenge(challenge.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="create">
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Challenge</CardTitle>
                    <CardDescription>Fill out the form below to create a new challenge</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateChallenge} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={newChallenge.title}
                          onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newChallenge.description}
                          onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date & Time</Label>
                          <div className="flex">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !newChallenge.start_date && "text-muted-foreground",
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {newChallenge.start_date ? (
                                    format(new Date(newChallenge.start_date), "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={new Date(newChallenge.start_date)}
                                  onSelect={(date) =>
                                    date &&
                                    setNewChallenge({
                                      ...newChallenge,
                                      start_date: date.toISOString(),
                                    })
                                  }
                                />
                              </PopoverContent>
                            </Popover>
                            <Input
                              type="time"
                              className="ml-2 w-24"
                              value={getTimeValue(newChallenge.start_date)}
                              onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(":")
                                const date = new Date(newChallenge.start_date)
                                if (!isNaN(date.getTime())) {
                                  date.setHours(Number.parseInt(hours), Number.parseInt(minutes))
                                  setNewChallenge({ ...newChallenge, start_date: date.toISOString() })
                                }
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>End Date & Time</Label>
                          <div className="flex">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !newChallenge.end_date && "text-muted-foreground",
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {newChallenge.end_date ? (
                                    format(new Date(newChallenge.end_date), "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={new Date(newChallenge.end_date)}
                                  onSelect={(date) =>
                                    date &&
                                    setNewChallenge({
                                      ...newChallenge,
                                      end_date: date.toISOString(),
                                    })
                                  }
                                />
                              </PopoverContent>
                            </Popover>
                            <Input
                              type="time"
                              className="ml-2 w-24"
                              value={getTimeValue(newChallenge.end_date)}
                              onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(":")
                                const date = new Date(newChallenge.end_date)
                                if (!isNaN(date.getTime())) {
                                  date.setHours(Number.parseInt(hours), Number.parseInt(minutes))
                                  setNewChallenge({ ...newChallenge, end_date: date.toISOString() })
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rules">Rules</Label>
                        <Textarea
                          id="rules"
                          value={newChallenge.rules}
                          onChange={(e) => setNewChallenge({ ...newChallenge, rules: e.target.value })}
                          rows={3}
                          placeholder="Enter challenge rules, one per line"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="prize_description">Prize Description</Label>
                        <Textarea
                          id="prize_description"
                          value={newChallenge.prize_description}
                          onChange={(e) => setNewChallenge({ ...newChallenge, prize_description: e.target.value })}
                          rows={2}
                        />
                      </div>

                      <Button type="submit" className="w-full">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Challenge
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {selectedChallenge && (
                <TabsContent value="edit">
                  <Card>
                    <CardHeader>
                      <CardTitle>Edit Challenge</CardTitle>
                      <CardDescription>Update the challenge details</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleUpdateChallenge} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-title">Title</Label>
                          <Input
                            id="edit-title"
                            value={selectedChallenge.title}
                            onChange={(e) => setSelectedChallenge({ ...selectedChallenge, title: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-description">Description</Label>
                          <Textarea
                            id="edit-description"
                            value={selectedChallenge.description}
                            onChange={(e) =>
                              setSelectedChallenge({ ...selectedChallenge, description: e.target.value })
                            }
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Start Date & Time</Label>
                            <div className="flex">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !selectedChallenge.start_date && "text-muted-foreground",
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedChallenge.start_date ? (
                                      format(new Date(selectedChallenge.start_date), "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={new Date(selectedChallenge.start_date)}
                                    onSelect={(date) =>
                                      date &&
                                      setSelectedChallenge({
                                        ...selectedChallenge,
                                        start_date: date.toISOString(),
                                      })
                                    }
                                  />
                                </PopoverContent>
                              </Popover>
                              <Input
                                type="time"
                                className="ml-2 w-24"
                                value={getTimeValue(selectedChallenge.start_date)}
                                onChange={(e) => {
                                  const [hours, minutes] = e.target.value.split(":")
                                  const date = new Date(selectedChallenge.start_date)
                                  if (!isNaN(date.getTime())) {
                                    date.setHours(Number.parseInt(hours), Number.parseInt(minutes))
                                    setSelectedChallenge({ ...selectedChallenge, start_date: date.toISOString() })
                                  }
                                }}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>End Date & Time</Label>
                            <div className="flex">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !selectedChallenge.end_date && "text-muted-foreground",
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedChallenge.end_date ? (
                                      format(new Date(selectedChallenge.end_date), "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={new Date(selectedChallenge.end_date)}
                                    onSelect={(date) =>
                                      date &&
                                      setSelectedChallenge({
                                        ...selectedChallenge,
                                        end_date: date.toISOString(),
                                      })
                                    }
                                  />
                                </PopoverContent>
                              </Popover>
                              <Input
                                type="time"
                                className="ml-2 w-24"
                                value={getTimeValue(selectedChallenge.end_date)}
                                onChange={(e) => {
                                  const [hours, minutes] = e.target.value.split(":")
                                  const date = new Date(selectedChallenge.end_date)
                                  if (!isNaN(date.getTime())) {
                                    date.setHours(Number.parseInt(hours), Number.parseInt(minutes))
                                    setSelectedChallenge({ ...selectedChallenge, end_date: date.toISOString() })
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-rules">Rules</Label>
                          <Textarea
                            id="edit-rules"
                            value={selectedChallenge.rules}
                            onChange={(e) => setSelectedChallenge({ ...selectedChallenge, rules: e.target.value })}
                            rows={3}
                            placeholder="Enter challenge rules, one per line"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-prize_description">Prize Description</Label>
                          <Textarea
                            id="edit-prize_description"
                            value={selectedChallenge.prize_description}
                            onChange={(e) =>
                              setSelectedChallenge({ ...selectedChallenge, prize_description: e.target.value })
                            }
                            rows={2}
                          />
                        </div>

                        <div className="flex justify-between">
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => selectedChallenge.id && handleDeleteChallenge(selectedChallenge.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Challenge
                          </Button>
                          <Button type="submit">Save Changes</Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}

