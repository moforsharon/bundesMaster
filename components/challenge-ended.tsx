import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Calendar } from "lucide-react"

interface ChallengeEndedProps {
  challengeTitle: string
}

export default function ChallengeEnded({ challengeTitle }: ChallengeEndedProps) {
  return (
    <Card className="bg-gray-50 border-gray-100">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold text-gray-700">Challenge Ended</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6 py-6">
        <Trophy className="h-16 w-16 text-yellow-500" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-medium text-gray-800">{challengeTitle} has ended</h3>
          <p className="text-gray-600">Thank you for participating! Check back soon for new challenges.</p>
        </div>
        <div className="flex items-center text-sm text-blue-600">
          <Calendar className="mr-2 h-4 w-4" />
          <span>Next challenge coming soon</span>
        </div>
      </CardContent>
    </Card>
  )
}

