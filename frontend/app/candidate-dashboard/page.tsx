import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, BarChart3, ArrowLeft } from "lucide-react"

export default function CandidateDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Role Selection
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Candidate Dashboard</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Register to contest in voting sessions and track your candidacy status.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Contest Vote */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 bg-secondary/10 rounded-full w-fit">
                <UserPlus className="h-10 w-10 text-secondary" />
              </div>
              <CardTitle className="text-2xl">Contest Vote</CardTitle>
              <CardDescription className="text-base">
                Register yourself as a candidate for an active voting session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/contest-vote">
                <Button variant="secondary" className="w-full" size="lg">
                  Register as Candidate
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* View Results */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 bg-chart-1/10 rounded-full w-fit">
                <BarChart3 className="h-10 w-10 text-chart-1" />
              </div>
              <CardTitle className="text-2xl">View Results</CardTitle>
              <CardDescription className="text-base">Check your performance and voting results</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/results">
                <Button
                  variant="outline"
                  className="w-full border-chart-1 text-chart-1 hover:bg-chart-1 hover:text-white bg-transparent"
                  size="lg"
                >
                  View Results
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
