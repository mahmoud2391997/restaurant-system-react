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
  item_id: z.string(),
  change: z.enum(["increment", "decrement"]),
  quantity: z.number().min(0.01, "Quantity must be positive"),
  adjustment_type: z.enum(["manual", "physical_count", "variance"]),
  notes: z.string().optional(),
})

interface StockAdjustmentFormProps {
  item: InventoryItem
  onSubmit: (values: z.infer<typeof formSchema>) => void
  onCancel: () => void
}

export function StockAdjustmentForm({
  item,
  onSubmit,
  onCancel,
}: StockAdjustmentFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      item_id: item.id,
      change: "increment",
      quantity: 0,
      adjustment_type: "manual",
      notes: "",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="p-4 border rounded-md bg-gray-50">
          <h3 className="font-medium">{item.name}</h3>
          <p className="text-sm text-muted-foreground">
            Current Stock: {item.currentStock} {item.unit} | Min Stock: {item.minimumStock} {item.unit}
          </p>
        </div>

        <FormField
          control={form.control}
          name="change"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adjustment Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select adjustment type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="increment">Increase Stock</SelectItem>
                  <SelectItem value="decrement">Decrease Stock</SelectItem>
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

        <FormField
          control={form.control}
          name="adjustment_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="manual">Manual Adjustment</SelectItem>
                  <SelectItem value="physical_count">Physical Count</SelectItem>
                  <SelectItem value="variance">Variance</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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
          <Button type="submit">Save Adjustment</Button>
        </div>
      </form>
    </Form>
  )
}