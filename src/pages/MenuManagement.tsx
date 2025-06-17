"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { 
  fetchCategories,
  fetchModifiers,
  fetchMenuItems,
  fetchItemModifiersByMenuItem,
  setCategoriesSearch,
  setModifiersSearch,
  selectCategories,
  selectModifiers,
  selectItemModifiers,
  selectCategoriesLoading,
  selectModifiersLoading,
  selectItemModifiersLoading,
  createCategory,
  addItemModifier,
  createMenuItem,
  createModifier,
} from "../store/slices/menuSlice"
import { AppDispatch } from "../store/index"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Plus, Search, Edit, Trash2, Eye, EyeOff, DollarSign, Package, TrendingUp, Settings, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Switch } from "../../components/ui/switch"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "../../components/ui/use-toast"

// Form validation schemas
const menuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().min(0.01, "Price must be greater than 0"),
  cost: z.number().min(0, "Cost cannot be negative"),
  category_id: z.string().min(1, "Category is required"),
  available: z.boolean().default(true),
  prep_time: z.number().min(1, "Prep time must be at least 1 minute").optional(),
  allergens: z.array(z.string()).optional(),
})

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
})

// Update the modifier schema
const modifierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.enum(["single", "multiple"]),
  is_required: z.boolean().default(false),
  max_selections: z.number().min(1).default(1),
  options: z.array(
    z.object({
      name: z.string().min(1, "Option name is required"),
      price_adjustment: z.number().default(0),
      is_available: z.boolean().default(true),
    })
  ).min(1, "At least one option is required")
  .superRefine((options, ctx) => {
    // Validate each option has a name
    options.forEach((option, index) => {
      if (!option.name || option.name.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Option name is required",
          path: [index, "name"]
        });
      }
    });
  }),
});

type ModifierFormData = z.infer<typeof modifierSchema>;
export interface MenuModifier {
  id: string
  menu_item_ids: string[]
  type:"single" | "multiple"
  name: string
  price_adjustment: number
  is_required: boolean
  max_selections: number
  options: ModifierOption[]
}

export interface ModifierOption {
  id: string
  modifier_id: string
  name: string
  price_adjustment: number
  is_available: boolean
}
// Update the mock modifiers to match the new structure
const mockModifiers: MenuModifier[] = [
  {
    id: "MOD-001",
    menu_item_ids: ["MENU-001", "MENU-004"],
    type: "single",
    name: "Cheese Options",
    price_adjustment: 0,
    is_required: false,
    max_selections: 1,
    options: [
      {
        id: "OPT-001",
        modifier_id: "MOD-001",
        name: "Extra Cheese",
        price_adjustment: 1.50,
        is_available: true,
      },
      {
        id: "OPT-002",
        modifier_id: "MOD-001",
        name: "No Cheese",
        price_adjustment: 0,
        is_available: true,
      },
    ],
  },
  {
    id: "MOD-002",
    menu_item_ids: ["MENU-001", "MENU-002", "MENU-004"],
    type: "multiple",
    name: "Toppings",
    price_adjustment: 0,
    is_required: false,
    max_selections: 3,
    options: [
      {
        id: "OPT-003",
        modifier_id: "MOD-002",
        name: "Pepperoni",
        price_adjustment: 2.00,
        is_available: true,
      },
      {
        id: "OPT-004",
        modifier_id: "MOD-002",
        name: "Mushrooms",
        price_adjustment: 1.50,
        is_available: true,
      },
      {
        id: "OPT-005",
        modifier_id: "MOD-002",
        name: "Olives",
        price_adjustment: 1.00,
        is_available: false,
      },
    ],
  },
];

type MenuItemFormData = z.infer<typeof menuItemSchema>
type CategoryFormData = z.infer<typeof categorySchema>

// Mock data
const mockCategories = [
  { _id: "CAT-001", name: "Pizzas", description: "Various pizza options" },
  { _id: "CAT-002", name: "Pastas", description: "Italian pasta dishes" },
  { _id: "CAT-003", name: "Desserts", description: "Sweet treats" },
  { _id: "CAT-004", name: "Drinks", description: "Beverages" },
];



const mockMenuItems = [
  {
    id: "MENU-001",
    name: "Margherita Pizza",
    description: "Fresh tomatoes, mozzarella, basil",
    price: 18.99,
    cost: 6.5,
    category_id: "CAT-001",
    available: true,
    popularity: 85,
    profit: 12.49,
    prep_time: 15,
    allergens: ["gluten", "dairy"],
  },
  {
    id: "MENU-002",
    name: "Spaghetti Carbonara",
    description: "Classic pasta with eggs, cheese, pancetta, and pepper",
    price: 16.50,
    cost: 5.2,
    category_id: "CAT-002",
    available: true,
    popularity: 78,
    profit: 11.30,
    prep_time: 20,
    allergens: ["gluten", "eggs"],
  },
  {
    id: "MENU-003",
    name: "Tiramisu",
    description: "Coffee-flavored Italian dessert",
    price: 8.99,
    cost: 2.8,
    category_id: "CAT-003",
    available: true,
    popularity: 92,
    profit: 6.19,
    prep_time: 10,
    allergens: ["dairy"],
  },
  {
    id: "MENU-004",
    name: "Pepperoni Pizza",
    description: "Classic pizza with pepperoni and mozzarella",
    price: 19.99,
    cost: 7.0,
    category_id: "CAT-001",
    available: false,
    popularity: 88,
    profit: 12.99,
    prep_time: 15,
    allergens: ["gluten", "dairy"],
  },
];

export default function MenuManagement() {
  const dispatch = useDispatch<AppDispatch>()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("items")
  const [openItemDialog, setOpenItemDialog] = useState(false)
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false)
  const [openModifierDialog, setOpenModifierDialog] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Use mock data instead of Redux selectors for preview
  const categories = mockCategories;
  const modifiers = mockModifiers;
  const menuItems = mockMenuItems;
  const itemModifiers = [];
  const categoriesLoading = false;
  const modifiersLoading = false;
  const itemModifiersLoading = false;

  // Form hooks
  const menuItemForm = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      cost: 0,
      category_id: "",
      available: true,
      prep_time: 10,
      allergens: [],
    }
  })

  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
    }
  })

const modifierForm = useForm<ModifierFormData>({
  resolver: zodResolver(modifierSchema),
  defaultValues: {
    name: "",
    description: "",
    type: "single",
    is_required: false,
    max_selections: 1,
    options: [{ name: "", price_adjustment: 0, is_available: true }], // Default one option
  }
})
  // Mock form submissions
  const onSubmitMenuItem = async (data: MenuItemFormData) => {
    setIsCreating(true)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Menu item created successfully (mock)",
        variant: "default",
      })
      
      setOpenItemDialog(false)
      menuItemForm.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create menu item",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const onSubmitCategory = async (data: CategoryFormData) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Category created successfully (mock)",
        variant: "default",
      })
      setOpenCategoryDialog(false)
      categoryForm.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      })
    }
  }

 const onSubmitModifier = async (data: ModifierFormData) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, you would send this data to your API
    const newModifier: MenuModifier = {
      id: `MOD-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      menu_item_ids: [], // You would assign these when linking to menu items
      type: data.type,
      name: data.name,
      price_adjustment: 0, // This would be calculated from options
      is_required: data.is_required,
      max_selections: data.max_selections,
      options: data.options.map((option, index) => ({
        id: `OPT-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        modifier_id: '', // This would be set by the backend
        name: option.name,
        price_adjustment: option.price_adjustment,
        is_available: option.is_available,
      })),
    };
await  dispatch(createModifier(newModifier))
    toast({
      title: "Success",
      description: "Modifier created successfully (mock)",
      variant: "default",
    });
    setOpenModifierDialog(false);
    modifierForm.reset();
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to create modifier",
      variant: "destructive",
    });
  }
};

  const filteredItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categories.find(cat => cat._id === item.category_id)?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalItems = menuItems.length
  const availableItems = menuItems.filter((item) => item.available).length
  const avgProfit = menuItems.reduce((sum, item) => sum + item.profit, 0) / menuItems.length
  const topPerformer = menuItems.reduce((prev, current) => (prev.popularity > current.popularity ? prev : current))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground">Manage your restaurant menu and pricing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Menu Settings
          </Button>
          
          {/* Add Item Dialog */}
          <Dialog open={openItemDialog} onOpenChange={setOpenItemDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Menu Item</DialogTitle>
              </DialogHeader>
              <form onSubmit={menuItemForm.handleSubmit(onSubmitMenuItem)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name*</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g. Margherita Pizza" 
                      {...menuItemForm.register("name")} 
                    />
                    {menuItemForm.formState.errors.name && (
                      <p className="text-sm text-red-500">{menuItemForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category_id">Category*</Label>
                    <Select 
                      onValueChange={(value) => menuItemForm.setValue("category_id", value)}
                      value={menuItemForm.watch("category_id")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {menuItemForm.formState.errors.category_id && (
                      <p className="text-sm text-red-500">{menuItemForm.formState.errors.category_id.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Item description" 
                    {...menuItemForm.register("description")} 
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price*</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      {...menuItemForm.register("price", { valueAsNumber: true })} 
                    />
                    {menuItemForm.formState.errors.price && (
                      <p className="text-sm text-red-500">{menuItemForm.formState.errors.price.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cost">Cost</Label>
                    <Input 
                      id="cost" 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      {...menuItemForm.register("cost", { valueAsNumber: true })} 
                    />
                    {menuItemForm.formState.errors.cost && (
                      <p className="text-sm text-red-500">{menuItemForm.formState.errors.cost.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prep_time">Prep Time (min)</Label>
                    <Input 
                      id="prep_time" 
                      type="number" 
                      placeholder="10" 
                      {...menuItemForm.register("prep_time", { valueAsNumber: true })} 
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="available" 
                    checked={menuItemForm.watch("available")} 
                    onCheckedChange={(checked) => menuItemForm.setValue("available", checked)}
                  />
                  <Label htmlFor="available">
                    {menuItemForm.watch("available") ? "Available" : "Unavailable"}
                  </Label>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setOpenItemDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Add Item"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">All menu items</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            {availableItems === totalItems ? (
              <Eye className="h-4 w-4 text-green-500" />
            ) : (
              <EyeOff className="h-4 w-4 text-yellow-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableItems}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((availableItems / totalItems) * 100)}% available
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgProfit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per item</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topPerformer.name}</div>
            <p className="text-xs text-muted-foreground">
              {topPerformer.popularity}% popularity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="items" className="space-y-6" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="items">Menu Items</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="engineering">Menu Engineering</TabsTrigger>
            <TabsTrigger value="modifiers">Modifiers</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={`Search ${activeTab}...`}
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Menu Items</CardTitle>
                <Dialog open={openItemDialog} onOpenChange={setOpenItemDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const category = categories.find(cat => cat._id === item.category_id)
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            {item.name}
                            {item.allergens && item.allergens.length > 0 && (
                              <div className="flex gap-1">
                                {item.allergens.map(allergen => (
                                  <Badge key={allergen} variant="outline">
                                    {allergen}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.description}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>{category?.name || "Uncategorized"}</TableCell>
                        <TableCell>${item.price.toFixed(2)}</TableCell>
                        <TableCell>${item.cost.toFixed(2)}</TableCell>
                        <TableCell>${item.profit.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={item.available ? "default" : "secondary"}>
                            {item.available ? "Available" : "Unavailable"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Menu Categories</CardTitle>
                <Dialog open={openCategoryDialog} onOpenChange={setOpenCategoryDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add New Category</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={categoryForm.handleSubmit(onSubmitCategory)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="category-name">Category Name*</Label>
                        <Input 
                          id="category-name" 
                          placeholder="e.g. Pizza, Pasta, Desserts" 
                          {...categoryForm.register("name")} 
                        />
                        {categoryForm.formState.errors.name && (
                          <p className="text-sm text-red-500">{categoryForm.formState.errors.name.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="category-description">Description</Label>
                        <Textarea 
                          id="category-description" 
                          placeholder="Category description" 
                          {...categoryForm.register("description")} 
                        />
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setOpenCategoryDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Add Category</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card key={category._id} className="border-2 hover:border-primary/50 cursor-pointer">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          {menuItems.filter(item => item.category_id === category._id).length} items
                        </p>
                        {category.description && (
                          <p className="text-sm">{category.description}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modifiers">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Menu Modifiers</CardTitle>
               {/* Modifier Dialog */}
<Dialog open={openModifierDialog} onOpenChange={setOpenModifierDialog}>
  <DialogTrigger asChild>
    <Button size="sm">
      <Plus className="h-4 w-4 mr-2" />
      Add Modifier
    </Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[600px]">
    <DialogHeader>
      <DialogTitle>Add New Modifier</DialogTitle>
    </DialogHeader>
    <form onSubmit={modifierForm.handleSubmit(onSubmitModifier)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="modifier-name">Modifier Name*</Label>
          <Input 
            id="modifier-name" 
            placeholder="e.g. Cheese Options" 
            {...modifierForm.register("name")} 
          />
          {modifierForm.formState.errors.name && (
            <p className="text-sm text-red-500">{modifierForm.formState.errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="modifier-type">Type*</Label>
          <Select
            onValueChange={(value) => modifierForm.setValue("type", value as "single" | "multiple")}
            defaultValue={modifierForm.watch("type")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single Selection</SelectItem>
              <SelectItem value="multiple">Multiple Selection</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Switch 
            id="is_required" 
            checked={modifierForm.watch("is_required")} 
            onCheckedChange={(checked) => modifierForm.setValue("is_required", checked)}
          />
          <Label htmlFor="is_required">Required</Label>
        </div>
        <div className="space-y-2">
          <Label htmlFor="max_selections">Max Selections</Label>
          <Input 
            id="max_selections" 
            type="number" 
            min="1"
            {...modifierForm.register("max_selections", { valueAsNumber: true })} 
          />
        </div>
      </div>

    <div className="space-y-2">
  <Label>Options*</Label>
  <div className="space-y-4">
    {modifierForm.watch("options")?.map((option, index) => (
      <div key={index} className="grid grid-cols-3 gap-4 items-end">
        <div className="space-y-2">
          <Label>Option Name*</Label>
          <Input
            placeholder="e.g. Extra Cheese"
            {...modifierForm.register(`options.${index}.name`, { required: true })}
          />
          {modifierForm.formState.errors.options?.[index]?.name && (
            <p className="text-sm text-red-500">Option name is required</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Price Adjustment</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            {...modifierForm.register(`options.${index}.price_adjustment`, { 
              valueAsNumber: true,
              required: true 
            })}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={modifierForm.watch(`options.${index}.is_available`)}
            onCheckedChange={(checked) => 
              modifierForm.setValue(`options.${index}.is_available`, checked)
            }
          />
          <Label>Available</Label>
       {modifierForm.watch("options").length > 1 && (
  <Button
    type="button"
    variant="ghost"
    size="sm"
    onClick={() => {
      const options = [...modifierForm.getValues().options]
      options.splice(index, 1)
      modifierForm.setValue("options", options)
    }}
  >
    <X className="h-4 w-4 text-red-500" />
  </Button>
)}
        </div>
      </div>
    ))}
    <Button
      type="button"
      variant="outline"
      onClick={() => {
        modifierForm.setValue("options", [
          ...modifierForm.getValues().options,
          { name: "", price_adjustment: 0, is_available: true },
        ])
      }}
    >
      <Plus className="h-4 w-4 mr-2" />
      Add Option
    </Button>
  </div>
  {modifierForm.formState.errors.options && (
    <p className="text-sm text-red-500">
      {modifierForm.formState.errors.options.message}
    </p>
  )}
</div>

      <div className="flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setOpenModifierDialog(false)}
        >
          Cancel
        </Button>
        <Button type="submit">Add Modifier</Button>
      </div>
    </form>
  </DialogContent>
</Dialog>
              </div>
            </CardHeader>
            <CardContent>
        <Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Type</TableHead>
      <TableHead>Required</TableHead>
      <TableHead>Options</TableHead>
      <TableHead>Menu Items</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {modifiers.map((modifier) => (
      <TableRow key={modifier.id}>
        <TableCell className="font-medium">
          {modifier.name}
          <div className="text-sm text-muted-foreground">
            Max {modifier.max_selections} selection{modifier.max_selections > 1 ? 's' : ''}
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline">
            {modifier.type === 'single' ? 'Single' : 'Multiple'}
          </Badge>
        </TableCell>
        <TableCell>
          {modifier.is_required ? (
            <Badge variant="default">Required</Badge>
          ) : (
            <Badge variant="outline">Optional</Badge>
          )}
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {modifier.options.map(option => (
              <Badge 
                key={option.id} 
                variant={option.is_available ? "default" : "secondary"}
                className="flex items-center gap-1"
              >
                {option.name}
                {option.price_adjustment > 0 && (
                  <span>(+${option.price_adjustment.toFixed(2)})</span>
                )}
              </Badge>
            ))}
          </div>
        </TableCell>
        <TableCell>
          <div className="text-sm">
            {modifier.menu_item_ids.length} item{modifier.menu_item_ids.length !== 1 ? 's' : ''}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" className="text-red-500">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}