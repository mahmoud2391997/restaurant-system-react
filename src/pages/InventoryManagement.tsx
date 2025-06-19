"use client"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  // Actions
  setSearch,
  setFilters,
  clearFilters,
  setSort,
  setPage,
  
  // Thunks
  fetchItems as fetchInventoryItems,
  fetchItemById as fetchInventoryItemById,
  createItem as createInventoryItem,
  updateItem as updateInventoryItem,
  deleteItem as deleteInventoryItem,
  fetchStockMovements,
  createStockMovement,
  fetchStockAdjustments,
  createStockAdjustment,
  fetchRecipes,
  fetchRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  fetchPurchaseOrders,
  createPurchaseOrder,
  // updatePurchaseOrder,
  // deletePurchaseOrder,
  fetchInventoryLogs,
  
  // Selectors
  selectPurchaseOrders,
  selectInventoryLogs,
  selectInventoryItems,
  selectInventoryLoading,
  selectInventoryError,
  selectInventoryPagination,
  selectInventoryFilters,
  selectInventorySearch,
  selectInventorySort,
  selectSelectedInventoryItem,
  selectStockMovements,
  selectStockAdjustments,
  selectRecipes
} from "@/store/slices/inventorySlice"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import {
  Package,
  AlertTriangle,
  TrendingDown,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  ArrowUpDown,
  MoreHorizontal,
  Trash2,
  X
} from "lucide-react"
import { fetchCategories, fetchMenuItems, selectCategories, selectMenuItems } from "@/store/slices/menuSlice"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InventoryItem, StockAdjustment, Recipe, QueryParams, StockMovement, MenuItem, PurchaseOrder, InventoryLog, MenuCategory } from "../types/entities"
import { InventoryItemForm } from "@/components/inventory/InventoryItemForm"

import { RecipeForm } from "@/components/inventory/RecipeForm"
import { StockMovementForm } from "@/components/inventory/StockMovementForm"
import { useToast } from "../../components/ui/use-toast"
import { Skeleton } from "../../components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"

import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { PurchaseOrderForm, PurchaseOrderFormValues } from "@/components/inventory/purchaseOrderForm"
import { StockAdjustmentForm } from "@/components/inventory/StockAdjustmentForm"

// Form schemas
const recipeFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Recipe name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  menuItemId: z.string().min(1, "Menu item is required"),
  ingredients: z.array(
    z.object({
      inventoryItemId: z.string().min(1, "Ingredient is required"),
      quantity: z.number().min(0.01, "Quantity must be greater than 0"),
      unit: z.string().min(1, "Unit is required"),
    })
  ).min(1, "At least one ingredient is required"),
  yieldQuantity: z.number().optional(),
  yieldUnit: z.string().optional(),
});

// Update your schema to match backend expectations
export const purchaseOrderFormSchema = z.object({
  supplier_name: z.string().min(1, "Supplier is required"),
  orderDate: z.string().min(1, "Order date is required"),
  status: z.enum(["pending", "received", "cancelled"]),
  createdBy: z.string().min(1, "Creator is required"),
  items: z.array(z.object({
    itemId: z.string().min(1, "Item is required"),
    quantity: z.number().min(0.1, "Quantity must be greater than zero"),
    unit_price: z.number().min(0.01, "Price must be positive"),
    total_price: z.number().optional()
  })).min(1, "At least one item is required"),
  total_amount: z.number().optional()
})

export type MovementType = 'in' | 'out' | 'transfer' | 'waste' | 'production';
interface StockMovementPayload {
  createdBy:string
  inventory_item_id: string;
  quantity: number;
  movement_type: MovementType;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  location_from?: string;
  location_to?: string;
}

type RecipeFormValues = z.infer<typeof recipeFormSchema>

export default function InventoryManagement() {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState("all-items")
  const [isItemFormOpen, setIsItemFormOpen] = useState(false)
  const [isAdjustmentFormOpen, setIsAdjustmentFormOpen] = useState(false)
  const [isMovementFormOpen, setIsMovementFormOpen] = useState(false)
  const [isRecipeFormOpen, setIsRecipeFormOpen] = useState(false)
  const [isPurchaseOrderFormOpen, setIsPurchaseOrderFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [editingPurchaseOrder, setEditingPurchaseOrder] = useState<PurchaseOrder | null>(null)
  const [selectedAdjustmentItem, setSelectedAdjustmentItem] = useState<InventoryItem | null>(null)

  // Select state from Redux store
  const {
    items,
    loading,
    error,
    stockMovements,
    stockAdjustments,
    recipes,
    purchaseOrders,
    inventoryLogs,
    selectedItem,
    menuItems,
    menuCategories,
    search,
    filters,
    sort,
    page,
    limit,
    total,
    totalPages
  } = useAppSelector((state) => ({
    items: selectInventoryItems(state),
    loading: selectInventoryLoading(state),
    error: selectInventoryError(state),
    stockMovements: selectStockMovements(state),
    stockAdjustments: selectStockAdjustments(state),
    recipes: selectRecipes(state),
    purchaseOrders: selectPurchaseOrders(state),
    inventoryLogs: selectInventoryLogs(state),
    selectedItem: selectSelectedInventoryItem(state),
    search: selectInventorySearch(state),
    filters: selectInventoryFilters(state),
    sort: selectInventorySort(state),
    menuItems: selectMenuItems(state),
    menuCategories: selectCategories(state),
    ...selectInventoryPagination(state)
  }))
console.log(recipes);

  // Recipe form selogtup
  const recipeForm = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      menuItemId: '',
      ingredients: [],
      yieldQuantity: undefined,
      yieldUnit: '',
    },
  });

  const { fields: recipeFields, append: appendRecipeIngredient, remove: removeRecipeIngredient } = useFieldArray({
    name: "ingredients",
    control: recipeForm.control,
  })

  // Purchase order form setup
  const purchaseOrderForm = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderFormSchema),
    defaultValues: {
      supplier_name: "",
      orderDate: new Date().toISOString().split('T')[0],
      status: "pending",
      createdBy: "current_user_id", // Set this from auth context
      items: [],
    },
  });

  // Load menu data when component mounts
  useEffect(() => {
    dispatch(fetchCategories({}))
    dispatch(fetchMenuItems({}))
  }, [dispatch])

  // Fetch data when tab or filters change
  useEffect(() => {
    const params: QueryParams = {
      page,
      limit,
      search,
      sort,
      filters: {
        ...filters,
        ...(activeTab === 'low-stock' ? { minimum_stock: true } : {})
      }
    }

    switch (activeTab) {
      case 'all-items':
      case 'low-stock':
        dispatch(fetchInventoryItems(params))
        break
      case 'movements':
        dispatch(fetchStockMovements(params))
        break
      case 'adjustments':
        dispatch(fetchStockAdjustments(params))
        break
      case 'recipes':
        dispatch(fetchRecipes(params))
        break
      case 'purchase-orders':
        dispatch(fetchPurchaseOrders(params))
        break
      case 'inventory-logs':
        dispatch(fetchInventoryLogs(params))
        break
    }
  }, [dispatch, activeTab, page, limit, search, sort, filters])

 const handleCreateItem = async (data: Omit<InventoryItem, "id">) => {
  try {
    await dispatch(createInventoryItem(data)).unwrap();
    toast({
      title: "Success",
      description: "Inventory item created successfully",
      variant: "default",
    });
    setIsItemFormOpen(false);
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to create inventory item",
      variant: "destructive",
    });
  }
}

const handleUpdateItem = async (values: Omit<InventoryItem, "id"> & { id?: string }) => {
  if (!values.id) return;
  
  try {
    await dispatch(updateInventoryItem({ id: values.id, data: values })).unwrap()
          toast({
        title: "Success",
        description: "Inventory item updated successfully",
        variant: "default",
      })
      setIsItemFormOpen(false)
      setEditingItem(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update inventory item",
        variant: "destructive",
      })
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      await dispatch(deleteInventoryItem(id)).unwrap()
      toast({
        title: "Success",
        description: "Inventory item deleted successfully",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete inventory item",
        variant: "destructive",
      })
    }
  }

  const handleSearch = (term: string) => {
    dispatch(setSearch(term))
    dispatch(setPage(1))
  }

const handleStockAdjustment = async (values: {
  change: "increment" | "decrement";
  quantity: number;
  createdAt: Date;
  item_id: string;
  adjustment_type: "manual" | "physical_count" | "variance";
  notes?: string;
  
}) => {
  try {
    const adjustment: Omit<StockAdjustment, "id" | "createdAt"> = {
      itemId: values.item_id,
        change: values.change,
      quantity: values.quantity,
      adjustmentType: values.adjustment_type,
      notes: values.notes,
    };
    await dispatch(createStockAdjustment(adjustment)).unwrap()
      toast({
        title: "Success",
        description: "Stock adjustment recorded successfully with movement",
        variant: "default",
      })
      setIsAdjustmentFormOpen(false)
      setSelectedAdjustmentItem(null)
      dispatch(fetchStockAdjustments({ page, limit }))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record stock adjustment",
        variant: "destructive",
      })
    }
  }

  const handleCreateMovement = async (movement: StockMovementPayload) => {
    try {
      await dispatch(createStockMovement({...movement,createdBy:"684e57d7b336ae494988ea94"})).unwrap()
      toast({
        title: "Success",
        description: "Stock movement recorded successfully",
        variant: "default",
      })
      setIsMovementFormOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record stock movement",
        variant: "destructive",
      })
    }
  }
const handleDeleteRecipe = async (id: string) => {
  try {
    await dispatch(deleteRecipe(id)).unwrap();
    toast({
      title: "Success",
      description: "Recipe deleted successfully",
      variant: "default",
    });
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to delete recipe",
      variant: "destructive",
    });
  }
};
const handleCreateRecipe = async (data: RecipeFormValues) => {
  try {
    console.log("Creating recipe with data:", data)
    
    const recipePayload = {
      menuItemId: data.menuItemId,
      name: data.name,
      description: data.description,
      category: data.category,
      ingredients: data.ingredients.map(ing => ({
        inventoryItemId: ing.inventoryItemId,
        quantity: ing.quantity,
        unit: ing.unit,
      })),
    };

    await dispatch(createRecipe(recipePayload)).unwrap();

    // Create stock movements for each ingredient
    for (const ingredient of data.ingredients) {
      const movementPayload: StockMovementPayload = {
        createdBy: "684e57d7b336ae494988ea94",
        inventory_item_id: ingredient.inventoryItemId,
        quantity: ingredient.quantity,
        movement_type: 'out',
        reference_type: 'recipe',
        reference_id: data.menuItemId,
        notes: `Used in recipe ${data.name}`
      };
      await dispatch(createStockMovement(movementPayload));
    }

    toast({
      title: "Success",
      description: "Recipe created successfully",
      variant: "default",
    });
    
    setIsRecipeFormOpen(false);
    recipeForm.reset();
  } catch (error) {
    console.error("Error creating recipe:", error)
    toast({
      title: "Error",
      description: "Failed to create recipe",
      variant: "destructive",
    });
  }
};

  const handleSort = (field: string) => {
    const order = sort.field === field && sort.order === "asc" ? "desc" : "asc"
    dispatch(setSort({ field, order }))
  }

  const getStatusBadge = (item: InventoryItem) => {
    if (item.locked) {
      return <Badge variant="secondary">Locked</Badge>
    }
    if (item.currentStock <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    }
    if (item.currentStock <= item.minimumStock) {
      return <Badge variant="secondary">Low Stock</Badge>
    }
    return <Badge variant="default">In Stock</Badge>
  }

  // Calculate stats
  const lowStockItems = items.filter(item => item.currentStock <= item.minimumStock)
  const totalValue = items.reduce((sum, item) => sum + (item.currentStock * (item.costPerUnit || 0)), 0)
  const lockedItems = items.filter(item => item.locked).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Track and manage your inventory items</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => {
            setEditingItem(null)
            setIsItemFormOpen(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">Active inventory items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {lowStockItems.length}
            </div>
            <p className="text-xs text-muted-foreground">Items need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Current inventory value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locked Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lockedItems}
            </div>
            <p className="text-xs text-muted-foreground">Items not available</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all-items">All Items</TabsTrigger>
            <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
            <TabsTrigger value="movements">Movements</TabsTrigger>
            <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
            <TabsTrigger value="recipes">Recipes</TabsTrigger>
            <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
            <TabsTrigger value="inventory-logs">Inventory Logs</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search inventory..."
                className="pl-10 w-64"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={filters.minimum_stock === true}
                  onCheckedChange={(checked) => dispatch(setFilters({ minimum_stock: checked || undefined }))}
                >
                  Low Stock Only
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.category === "raw"}
                  onCheckedChange={(checked) => dispatch(setFilters({ category: checked ? "raw" : undefined }))}
                >
                  Raw Materials
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.category === "semi-finished"}
                  onCheckedChange={(checked) => dispatch(setFilters({ category: checked ? "semi-finished" : undefined }))}
                >
                  Semi-Finished
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => dispatch(clearFilters())}>
                  Clear Filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <TabsContent value="all-items">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Inventory Items</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dispatch(setPage(Math.max(1, page - 1)))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dispatch(setPage(Math.min(totalPages, page + 1)))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading && !items.length ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead onClick={() => handleSort("name")}>
                        Name <ArrowUpDown className="inline" />
                      </TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead onClick={() => handleSort("currentStock")}>
                        Current Stock <ArrowUpDown className="inline" />
                      </TableHead>
                      <TableHead>Min Stock</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead onClick={() => handleSort("costPerUnit")}>
                        Cost/Unit <ArrowUpDown className="inline" />
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id} className="cursor-pointer">
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{item.currentStock}</TableCell>
                        <TableCell>{item.minimumStock}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>${item.costPerUnit.toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(item)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setEditingItem(item)
                                setIsItemFormOpen(true)
                              }}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedAdjustmentItem(item)
                                setIsAdjustmentFormOpen(true)
                              }}>
                                Adjust Stock
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteItem(item.id)}>
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low-stock">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Low Stock Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : lowStockItems.length === 0 ? (
                <p className="text-muted-foreground">No low stock items found.</p>
              ) : (
                <div className="space-y-4">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="border rounded p-4 flex justify-between items-center bg-orange-50">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Current: {item.currentStock} | Min: {item.minimumStock} | Unit: {item.unit}
                        </p>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => {
                          setSelectedAdjustmentItem(item)
                          setIsAdjustmentFormOpen(true)
                        }}
                      >
                        Adjust Stock
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Stock Movements</CardTitle>
                <Button onClick={() => setIsMovementFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Movement
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : stockMovements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4" />
                  <p>No stock movements found</p>
                  <p className="text-sm">Select an item to view its movement history</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockMovements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>
                          {new Date(movement.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {items.find(item => item.id === movement.inventory_item_id)?.name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {movement.movement_type}
                          </Badge>
                        </TableCell>
                        <TableCell className={
                          movement.movement_type === 'in' ? 'text-green-600' : 'text-red-600'
                        }>
                          {(movement.movement_type === 'in' ? '+' : '-')}{movement.quantity}
                        </TableCell>
                        <TableCell>
                          {movement.reference_type && (
                            <Badge variant="secondary">
                              {movement.reference_type}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {movement.notes}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adjustments">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Stock Adjustments</CardTitle>
                <Button onClick={() => setIsAdjustmentFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Adjustment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : stockAdjustments.length === 0 ? (
                <p className="text-muted-foreground">No stock adjustments found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockAdjustments.map((adj) => (
                      <TableRow key={adj.id}>
                        <TableCell>{new Date(adj.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{items.find(i => i.id === adj.itemId)?.name || adj.itemId}</TableCell>
                        <TableCell>{adj.quantity}</TableCell>
                        <TableCell>{adj.adjustmentType}</TableCell>
                        <TableCell>{adj.notes || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchase-orders">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Purchase Orders</CardTitle>
                <Button onClick={() => {
                  setEditingPurchaseOrder(null)
                  setIsPurchaseOrderFormOpen(true)
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Purchase Order
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : purchaseOrders.length === 0 ? (
                <p className="text-muted-foreground">No purchase orders found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOrders.map((order,index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{index}</TableCell>
                        <TableCell>{order.supplier_name}</TableCell>
                        <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {order.items.map((item, i) => {
                              const itemName = items.find(i => i.id === item.item_id)?.name || item.item_id
                              return (
                                <div key={i} className="text-sm">
                                  {itemName} - {item.quantity} @ ${item.unit_price.toFixed(2)}
                                </div>
                              )
                            })}
                          </div>
                        </TableCell>
                        <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === 'received' ? 'default' :
                              order.status === 'cancelled' ? 'destructive' : 'secondary'
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory-logs">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Inventory Logs</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : inventoryLogs.length === 0 ? (
                <p className="text-muted-foreground">No inventory logs found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity Change</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryLogs.map((log) => {
                      const itemName = items.find(i => i.id === log.item_id)?.name || log.item_name || log.item_id
                      const quantityChange = log.quantity_changed > 0 
                        ? `+${log.quantity_changed}`
                        : log.quantity_changed.toString()
                      
                      return (
                        <TableRow key={log.id}>
                          <TableCell>
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                              log.action === 'create' ? 'bg-green-100 text-green-800' :
                              log.action === 'delete' ? 'bg-red-100 text-red-800' :
                              log.action === 'adjustment' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {log.action}
                            </span>
                          </TableCell>
                          <TableCell>{log.user}</TableCell>
                          <TableCell>{itemName}</TableCell>
                          <TableCell className={
                            log.quantity_changed > 0 ? 'text-green-600' : 'text-red-600'
                          }>
                            {quantityChange}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {log.reason || 'No details provided'}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

<TabsContent value="recipes">
  <Card>
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle>Recipes</CardTitle>
        <Button onClick={() => {
          recipeForm.reset()
          setIsRecipeFormOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          New Recipe 
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : recipes.length === 0 ? (
        <p className="text-muted-foreground">No recipes found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Ingredients</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recipes.map((recipe) => {
              // Find category name
              const category = menuCategories.find(c => c.id === recipe.category)?.name || recipe.category;
              
              // Find menu item name
              const menuItem = menuItems.find(mi => mi.id === recipe.menuItemId)?.name || recipe.menuItemId;

              return (
                <TableRow key={recipe.id}>
                  <TableCell>{recipe.name}</TableCell>
                  <TableCell>{category}</TableCell>
                  <TableCell>{recipe.description || '-'}</TableCell>
                  <TableCell>
                 <TableCell>
  <ul className="list-disc list-inside">
    {recipe.ingredients.map((ingredient, idx) => {
      const item = items.find(i => i.id === ingredient.inventoryItemId);
      return (
        <li key={idx}>
          {item?.name || 'Unknown Item'}: {ingredient.quantity} {ingredient.unit}
        </li>
      );
    })}
  </ul>
</TableCell>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          recipeForm.reset({
                            id: recipe.id,
                            name: recipe.name,
                            description: recipe.description,
                            category: recipe.category,
                            menuItemId: recipe.menuItemId,
                            ingredients: recipe.ingredients.map(ing => ({
                              inventoryItemId: ing.inventoryItemId,
                              quantity: ing.quantity,
                              unit: ing.unit
                            })),
                          });
                          setIsRecipeFormOpen(true);
                        }}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteRecipe(recipe.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </CardContent>
  </Card>
</TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={isItemFormOpen} onOpenChange={setIsItemFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Inventory Item" : "Add New Item"}</DialogTitle>
          </DialogHeader>
          <InventoryItemForm
            item={editingItem}
            onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
            onCancel={() => {
              setIsItemFormOpen(false);
              setEditingItem(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAdjustmentFormOpen} onOpenChange={setIsAdjustmentFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stock Adjustment</DialogTitle>
          </DialogHeader>
      {selectedAdjustmentItem && (
  <StockAdjustmentForm
    item={selectedAdjustmentItem}
onSubmit={({ quantity, change, item_id, adjustment_type, notes }) => {
  handleStockAdjustment({
    quantity,
    change,
    item_id,
    adjustment_type,
    notes,
    createdAt: new Date(),
  });
}}    onCancel={() => {
      setIsAdjustmentFormOpen(false);
      setSelectedAdjustmentItem(null);
    }}
  />
)}

        </DialogContent>
      </Dialog>

      <Dialog open={isMovementFormOpen} onOpenChange={setIsMovementFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Stock Movement</DialogTitle>
          </DialogHeader>
          <StockMovementForm
            items={items}
            onSubmit={handleCreateMovement}
            onCancel={() => setIsMovementFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <RecipeForm
        open={isRecipeFormOpen}
        onOpenChange={setIsRecipeFormOpen}
        form={recipeForm}
        fields={recipeFields}
        append={appendRecipeIngredient}
        remove={removeRecipeIngredient}
        menuItems={menuItems}
        menuCategories={menuCategories}
        inventoryItems={items}
        onSubmit={handleCreateRecipe}
      />

      <Dialog open={isPurchaseOrderFormOpen} onOpenChange={setIsPurchaseOrderFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingPurchaseOrder ? "Edit Purchase Order" : "New Purchase Order"}</DialogTitle>
          </DialogHeader>
          <PurchaseOrderForm
            form={purchaseOrderForm}
            inventoryItems={items}
            onCancel={() => setIsPurchaseOrderFormOpen(false)}  
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}