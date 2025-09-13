import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, StopCircle, BarChart3, ArrowLeft } from "lucide-react"

export default function AdminDashboard() {
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
          <h1 className="text-4xl font-bold text-foreground mb-4">Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage voting sessions, create new votes, and oversee the democratic process.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Create Vote */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Create Vote</CardTitle>
              <CardDescription>Start a new voting session</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/create-vote">
                <Button className="w-full" size="lg">
                  Create New Vote
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* End Vote */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-destructive/10 rounded-full w-fit">
                <StopCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">End Vote</CardTitle>
              <CardDescription>Close an active voting session</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/end-vote">
                <Button variant="destructive" className="w-full" size="lg">
                  End Vote
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* View Results */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-chart-1/10 rounded-full w-fit">
                <BarChart3 className="h-8 w-8 text-chart-1" />
              </div>
              <CardTitle className="text-xl">View Results</CardTitle>
              <CardDescription>Check voting results and statistics</CardDescription>
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
