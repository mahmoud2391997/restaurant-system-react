import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { DollarSign, ShoppingCart, Users, TrendingUp, Clock, AlertTriangle } from "lucide-react"

const salesData = [
  { name: "Mon", sales: 4000, orders: 24 },
  { name: "Tue", sales: 3000, orders: 18 },
  { name: "Wed", sales: 5000, orders: 32 },
  { name: "Thu", sales: 4500, orders: 28 },
  { name: "Fri", sales: 6000, orders: 38 },
  { name: "Sat", sales: 8000, orders: 52 },
  { name: "Sun", sales: 7000, orders: 45 },
]

const categoryData = [
  { name: "Main Dishes", value: 45, color: "#ff6b35" },
  { name: "Beverages", value: 25, color: "#f7931e" },
  { name: "Appetizers", value: 20, color: "#ffcd3c" },
  { name: "Desserts", value: 10, color: "#c5d86d" },
]

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening at your restaurant today.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,847</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.2%</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5.1%</span> this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$22.40</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">-2.1%</span> from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Sales Overview</CardTitle>
            <CardDescription>Revenue and order trends for the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#ff6b35" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Distribution of sales across menu categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from your restaurant</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: "#1234",
                  customer: "John Doe",
                  items: "2x Burger, 1x Fries",
                  total: "$24.50",
                  status: "completed",
                  time: "2 min ago",
                },
                {
                  id: "#1235",
                  customer: "Jane Smith",
                  items: "1x Pizza, 2x Coke",
                  total: "$18.75",
                  status: "preparing",
                  time: "5 min ago",
                },
                {
                  id: "#1236",
                  customer: "Mike Johnson",
                  items: "3x Tacos, 1x Salad",
                  total: "$32.25",
                  status: "pending",
                  time: "8 min ago",
                },
                {
                  id: "#1237",
                  customer: "Sarah Wilson",
                  items: "1x Pasta, 1x Wine",
                  total: "$28.00",
                  status: "completed",
                  time: "12 min ago",
                },
              ].map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{order.id}</span>
                      <Badge
                        variant={
                          order.status === "completed"
                            ? "default"
                            : order.status === "preparing"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{order.customer}</p>
                    <p className="text-sm text-gray-500">{order.items}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{order.total}</p>
                    <p className="text-sm text-gray-500">{order.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Avg Prep Time</span>
              </div>
              <span className="font-medium">12 min</span>
            </div>
            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Kitchen Efficiency</span>
                <span>87%</span>
              </div>
              <Progress value={87} className="h-2" />
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Staff Performance</span>
                <span>92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Low Stock Items</span>
              </div>
              <Badge variant="destructive">3</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
