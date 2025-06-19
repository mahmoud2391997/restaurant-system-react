"use client"
import { useEffect } from "react";
import {
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormReturn,
} from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { InventoryItem, MenuItem, MenuCategory } from "@/types/entities";
import * as z from "zod";
import { Trash2 } from "lucide-react";

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

type RecipeFormValues = z.infer<typeof recipeFormSchema>;

interface RecipeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuItems: MenuItem[];
  menuCategories: MenuCategory[];
  form: UseFormReturn<RecipeFormValues>;
  fields: FieldArrayWithId<RecipeFormValues, "ingredients", "id">[];
  append: UseFieldArrayAppend<RecipeFormValues, "ingredients">;
  remove: UseFieldArrayRemove;
  inventoryItems: InventoryItem[];
  onSubmit: (data: RecipeFormValues) => void;
}

export function RecipeForm({
  open,
  onOpenChange,
  form,
  fields,
  append,
  remove,
  menuItems,
  menuCategories,
  inventoryItems,
  onSubmit,
}: RecipeFormProps) {
  // Normalize data to handle both _id and id fields consistently
  const normalizedMenuItems = menuItems.map(item => ({
    ...item,
    id: item._id || item.id,
  }));

  const normalizedMenuCategories = menuCategories.map(cat => ({
    ...cat,
    id: cat._id || cat.id,
  }));

  const normalizedInventoryItems = inventoryItems.map(item => ({
    ...item,
    id: item.id || item.id,
  }));

  // Group menu items by category
  const menuItemsByCategory = normalizedMenuCategories.map(category => ({
    ...category,
    items: normalizedMenuItems.filter(item => item.category_id === category.id)
  })).filter(category => category.items.length > 0);

  // Reset form when opening
  useEffect(() => {
    if (open) {
      form.reset({
        menuItemId: "",
        category: "",
        name: "",
        description: "",
        ingredients: [{
          inventoryItemId: "",
          quantity: 1,
          unit: ""
        }],
        yieldQuantity: undefined,
        yieldUnit: "",
      });
    }
  }, [open, form]);

  const handleSubmit = (data: RecipeFormValues) => {
    onSubmit(data);
  };

  const handleInventoryItemChange = (index: number, inventoryItemId: string) => {
    const selectedItem = normalizedInventoryItems.find(item => item.id === inventoryItemId);
    if (selectedItem) {
      form.setValue(`ingredients.${index}.unit`, selectedItem.unit);
    }
  };

  const handleMenuItemChange = (menuItemId: string) => {
    const selectedMenuItem = normalizedMenuItems.find(item => item.id === menuItemId);
    if (selectedMenuItem) {
      form.setValue("menuItemId", selectedMenuItem.id);
      form.setValue("name", selectedMenuItem.name);
      form.setValue("description", selectedMenuItem.description || "");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{form.getValues("id") ? "Edit" : "Add New"} Recipe</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Category Selection */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Menu Category*</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("menuItemId", "");
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {normalizedMenuCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Menu Item Selection */}
            <FormField
              control={form.control}
              name="menuItemId"
              render={({ field }) => {
                const currentCategoryItems = menuItemsByCategory.find(
                  cat => cat.id === form.watch("category")
                )?.items || [];

                return (
                  <FormItem>
                    <FormLabel>Menu Item*</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleMenuItemChange(value);
                      }}
                      value={field.value}
                      disabled={!form.watch("category") || currentCategoryItems.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={
                            !form.watch("category") 
                              ? "Select a category first" 
                              : currentCategoryItems.length === 0 
                                ? "No items in this category" 
                                : "Select menu item"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currentCategoryItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} (${item.price?.toFixed(2)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Recipe Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipe Name*</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Recipe name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Recipe description (optional)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ingredients Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Ingredients*</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ 
                    inventoryItemId: "", 
                    quantity: 1, 
                    unit: "" 
                  })}
                >
                  Add Ingredient
                </Button>
              </div>

              {fields.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No ingredients added yet. Click "Add Ingredient" to start.
                </p>
              )}

              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-md">
                  {/* Ingredient Selection */}
                  <div className="col-span-5">
                    <FormField
                      control={form.control}
                      name={`ingredients.${index}.inventoryItemId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ingredient</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleInventoryItemChange(index, value);
                            }} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select ingredient" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {normalizedInventoryItems.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.name} ({item.unit})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Quantity */}
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name={`ingredients.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0.01"
                              step="0.01"
                              placeholder="0.00"
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Unit */}
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name={`ingredients.${index}.unit`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Unit"
                              readOnly
                              {...field}
                              className="bg-muted"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Remove Button */}
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Yield Information */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="yieldQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yield Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="0.00"
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yieldUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yield Unit</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., portions, servings"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {form.getValues("id") ? "Update" : "Add"} Recipe
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}