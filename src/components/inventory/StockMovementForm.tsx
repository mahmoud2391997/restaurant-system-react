"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"
import { Textarea } from "../../../components/ui/textarea"
import { InventoryItem } from "@/types/entities"

const formSchema = z.object({
  inventory_item_id: z.string().min(1, "Item is required"),
  quantity: z.number().min(0.01, "Quantity must be positive"),
  movement_type: z.enum(['in', 'out', 'transfer', 'waste', 'production']),
  createdBy: z.string().min(1, "Creator is required"), // Add this line
  reference_type: z.string().optional(),
  reference_id: z.string().optional(),
  notes: z.string().optional(),
  location_from: z.string().optional(),
  location_to: z.string().optional(),
})

interface StockMovementFormProps {
  items: InventoryItem[]
  onSubmit: (values: z.infer<typeof formSchema>) => void
  onCancel: () => void
}

export function StockMovementForm({
  items,
  onSubmit,
  onCancel,
}: StockMovementFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inventory_item_id: "",
      quantity: 0,
      movement_type: "in",
      notes: "",
    },
  })

  const movementType = form.watch("movement_type")

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="inventory_item_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inventory Item</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an item" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {items.map((item) => (
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

        <FormField
          control={form.control}
          name="movement_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Movement Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="in">Stock In</SelectItem>
                  <SelectItem value="out">Stock Out</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="waste">Waste</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {movementType === "transfer" && (
          <>
            <FormField
              control={form.control}
              name="location_from"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Location</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location_to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To Location</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Record Movement</Button>
        </div>
      </form>
    </Form>
  )
}