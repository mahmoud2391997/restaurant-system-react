"use client"
import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, AlertTriangle, TrendingDown, Lock } from "lucide-react"
import { InventoryItem } from "../../types/entities"
import { Badge } from "@/components/ui/badge"

interface DashboardProps {
  items: InventoryItem[]
}

export function InventoryDashboard({ items }: DashboardProps) {
  const stats = useMemo(() => {
    const lowStockItems = items.filter(item => 
      !item.locked && item.currentStock <= item.minimumStock
    )
    const totalValue = items.reduce(
      (sum, item) => sum + (item.currentStock * (item.costPerUnit || 0)), 0
    )
    const lockedItems = items.filter(item => item.locked).length

    return {
      totalItems: items.length,
      lowStockCount: lowStockItems.length,
      totalValue,
      lockedItems
    }
  }, [items])

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard 
        title="Total Items" 
        value={stats.totalItems} 
        icon={<Package className="h-4 w-4 text-muted-foreground" />}
        description="Active inventory items"
      />
      
      <StatCard 
        title="Low Stock" 
        value={stats.lowStockCount} 
        icon={<AlertTriangle className="h-4 w-4 text-orange-500" />}
        description="Items needing attention"
        variant={stats.lowStockCount > 0 ? "destructive" : "default"}
      />
      
      <StatCard 
        title="Total Value" 
        value={`$${stats.totalValue.toFixed(2)}`} 
        icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
        description="Current inventory value"
      />
      
      <StatCard 
        title="Locked Items" 
        value={stats.lockedItems} 
        icon={<Lock className="h-4 w-4 text-muted-foreground" />}
        description="Unavailable items"
      />
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  description: string
  variant?: "default" | "destructive"
}

function StatCard({ title, value, icon, description, variant = "default" }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${
          variant === "destructive" ? "text-destructive" : ""
        }`}>
          {value}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}