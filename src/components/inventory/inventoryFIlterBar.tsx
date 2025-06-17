"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDebounce } from "../../store/hooks"
import { useEffect, useState } from "react"

interface InventoryFilterBarProps {
  search: string
  filters: {
    type?: string
    category?: string
    lowStock?: boolean
  }
  onSearchChange: (value: string) => void
  onFilterChange: (filters: {
    type?: string
    category?: string
    lowStock?: boolean
  }) => void
}

export function InventoryFilterBar({
  search,
  filters,
  onSearchChange,
  onFilterChange
}: InventoryFilterBarProps) {
  const [localSearch, setLocalSearch] = useState(search)
  const debouncedSearch = useDebounce(localSearch, 300)

  useEffect(() => {
    onSearchChange(debouncedSearch)
  }, [debouncedSearch, onSearchChange])

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFilterChange({})
    setLocalSearch("")
  }

  const hasFilters = Object.values(filters).some(Boolean) || search

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          className="pl-10"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuCheckboxItem
            checked={filters.lowStock || false}
            onCheckedChange={(checked) => handleFilterChange("lowStock", checked)}
          >
            Low Stock Only
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.type === "raw"}
            onCheckedChange={(checked) => 
              handleFilterChange("type", checked ? "raw" : undefined)
            }
          >
            Raw Materials
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.type === "finished"}
            onCheckedChange={(checked) => 
              handleFilterChange("type", checked ? "finished" : undefined)
            }
          >
            Finished Goods
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {hasFilters && (
        <Button
          variant="ghost"
          onClick={clearFilters}
          className="px-2"
        >
          Clear
          <X className="h-4 w-4 ml-2" />
        </Button>
      )}
    </div>
  )
}