// "use client"

// import { useState, useEffect } from "react"
// import { Card, CardContent } from "@/components/ui/card"
// import { Clock } from "lucide-react"
// import { i18n } from "@/i18n-config"
// import { getCookie, setCookie } from "cookies-next"

// interface CountdownTimerProps {
//   targetDate: Date
//   onComplete?: () => void
// }

// export default function CountdownTimer({ targetDate, onComplete }: CountdownTimerProps) {
//   const [timeLeft, setTimeLeft] = useState({
//     days: 0,
//     hours: 0,
//     minutes: 0,
//     seconds: 0,
//   })
//   const [isComplete, setIsComplete] = useState(false)
//   const [currentLocale, setCurrentLocale] = useState<string>("fr")

//   useEffect(() => {
//     const locale = (getCookie("NEXT_LOCALE") as string) || i18n.defaultLocale
//     setCurrentLocale(locale)
//   }, [currentLocale])

//   useEffect(() => {
//     const calculateTimeLeft = () => {
//       const difference = targetDate.getTime() - new Date().getTime()

//       if (difference <= 0) {
//         setIsComplete(true)
//         if (onComplete) onComplete()
//         return {
//           days: 0,
//           hours: 0,
//           minutes: 0,
//           seconds: 0,
//         }
//       }

//       return {
//         days: Math.floor(difference / (1000 * 60 * 60 * 24)),
//         hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
//         minutes: Math.floor((difference / 1000 / 60) % 60),
//         seconds: Math.floor((difference / 1000) % 60),
//       }
//     }

//     // Initial calculation
//     setTimeLeft(calculateTimeLeft())

//     // Update every second
//     const timer = setInterval(() => {
//       const newTimeLeft = calculateTimeLeft()
//       setTimeLeft(newTimeLeft)
//     }, 1000)

//     // Clean up interval on unmount
//     return () => clearInterval(timer)
//   }, [targetDate, onComplete])

//   // Format numbers to always have two digits
//   const formatNumber = (num: number) => {
//     return num.toString().padStart(2, "0")
//   }


//   // Format the challenge date
//   const formatChallengeDate = (date: Date) => {
//     return date.toLocaleDateString('en-US', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     })
//   }

//   if (isComplete) {
//     return null
//   }

//   return (
//     <Card className="bg-blue-50 border-blue-100">
//       <CardContent className="pt-6">
//         <div className="flex flex-col items-center space-y-4">
//             <div className="text-sm text-green-600 mt-2 text-center">
//                 {/* <p>Challenge begins on:</p> */}
//                 <p className="font-medium">{formatChallengeDate(targetDate)}</p>
//             </div>
//           <div className="flex items-center text-blue-600">
//             <Clock className="mr-2 h-5 w-5" />
//             <span className="font-medium">Challenge starts in:</span>
//           </div>

//           <div className="grid grid-cols-4 gap-4 text-center">
//             <div className="flex flex-col">
//               <div className="text-2xl font-bold text-blue-700">{timeLeft.days}</div>
//               <div className="text-xs text-blue-600">Days</div>
//             </div>
//             <div className="flex flex-col">
//               <div className="text-2xl font-bold text-blue-700">{formatNumber(timeLeft.hours)}</div>
//               <div className="text-xs text-blue-600">Hours</div>
//             </div>
//             <div className="flex flex-col">
//               <div className="text-2xl font-bold text-blue-700">{formatNumber(timeLeft.minutes)}</div>
//               <div className="text-xs text-blue-600">Minutes</div>
//             </div>
//             <div className="flex flex-col">
//               <div className="text-2xl font-bold text-blue-700">{formatNumber(timeLeft.seconds)}</div>
//               <div className="text-xs text-blue-600">Seconds</div>
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }


"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { i18n } from "@/i18n-config"
import { getCookie, setCookie } from "cookies-next"

interface CountdownTimerProps {
  targetDate: Date
  onComplete?: () => void
}

export default function CountdownTimer({ targetDate, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isComplete, setIsComplete] = useState(false)
  const [currentLocale, setCurrentLocale] = useState<string>("fr")

  useEffect(() => {
    const locale = (getCookie("NEXT_LOCALE") as string) || i18n.defaultLocale
    setCurrentLocale(locale)
  }, [currentLocale])

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime()

      if (difference <= 0) {
        setIsComplete(true)
        if (onComplete) onComplete()
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        }
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }

    // Initial calculation
    setTimeLeft(calculateTimeLeft())

    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      setTimeLeft(newTimeLeft)
    }, 1000)

    // Clean up interval on unmount
    return () => clearInterval(timer)
  }, [targetDate, onComplete])

  // Format numbers to always have two digits
  const formatNumber = (num: number) => {
    return num.toString().padStart(2, "0")
  }

  // Format the challenge date based on locale
  const formatChallengeDate = (date: Date) => {
    return date.toLocaleDateString(currentLocale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Translation strings
  const translations = {
    en: {
      challengeBegins: "Challenge begins on:",
      startsIn: "Challenge starts in:",
      days: "Days",
      hours: "Hours",
      minutes: "Minutes",
      seconds: "Seconds"
    },
    fr: {
      challengeBegins: "Le défi commence le :",
      startsIn: "Le défi commence dans :",
      days: "Jours",
      hours: "Heures",
      minutes: "Minutes",
      seconds: "Secondes"
    }
  }

  if (isComplete) {
    return null
  }

  return (
    <Card className="bg-blue-50 border-blue-100">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4">
            <div className="text-sm text-green-600 mt-2 text-center">
                <p className="font-medium">{formatChallengeDate(targetDate)}</p>
            </div>
          <div className="flex items-center text-blue-600">
            <Clock className="mr-2 h-5 w-5" />
            <span className="font-medium">
              {currentLocale === 'fr' ? translations.fr.startsIn : translations.en.startsIn}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="flex flex-col">
              <div className="text-2xl font-bold text-blue-700">{timeLeft.days}</div>
              <div className="text-xs text-blue-600">
                {currentLocale === 'fr' ? translations.fr.days : translations.en.days}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-2xl font-bold text-blue-700">{formatNumber(timeLeft.hours)}</div>
              <div className="text-xs text-blue-600">
                {currentLocale === 'fr' ? translations.fr.hours : translations.en.hours}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-2xl font-bold text-blue-700">{formatNumber(timeLeft.minutes)}</div>
              <div className="text-xs text-blue-600">
                {currentLocale === 'fr' ? translations.fr.minutes : translations.en.minutes}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-2xl font-bold text-blue-700">{formatNumber(timeLeft.seconds)}</div>
              <div className="text-xs text-blue-600">
                {currentLocale === 'fr' ? translations.fr.seconds : translations.en.seconds}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}