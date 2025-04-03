import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, CheckCircle } from "lucide-react"

interface ChallengeDetailsProps {
  challenge: {
    title: string
    description: string
    rules: string[]
    rewards: string
  }
}

export default function ChallengeDetails({ challenge }: ChallengeDetailsProps) {
  return (
    <Card className="bg-white border-blue-100">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold text-blue-800">{challenge.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-gray-600 text-center">{challenge.description}</p>

        <div className="space-y-3">
          <h4 className="font-medium text-blue-700 flex items-center">
            <CheckCircle className="mr-2 h-4 w-4" />
            Challenge Rules
          </h4>
          <ul className="space-y-2 pl-6">
            {challenge.rules.map((rule, index) => (
              <li key={index} className="text-gray-700 list-disc">
                {rule}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h4 className="font-medium text-blue-700 flex items-center">
            <Award className="mr-2 h-4 w-4" />
            Rewards
          </h4>
          <p className="text-gray-700 mt-2">{challenge.rewards}</p>
        </div>
      </CardContent>
    </Card>
  )
}

