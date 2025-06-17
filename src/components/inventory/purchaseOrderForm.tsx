"use client"
import { useEffect, useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "../../../components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { useFieldArray } from "react-hook-form"
import { InventoryItem, Supplier } from "../../types/entities"
import { useAppDispatch } from "@/store/hooks"
import { createPurchaseOrder } from "@/store/slices/inventorySlice"
import { Value } from "@radix-ui/react-select"

export const purchaseOrderFormSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  supplier_name: z.string().min(1, "Supplier is required"),
  orderDate: z.string().min(1, "Order date is required"),
  status: z.enum(["pending", "received", "cancelled"]),
  createdBy: z.string().min(1, "Creator is required"),
  items: z.array(z.object({
  itemId: z.string().min(1, "Item is required"),
  item_name: z.string().min(1, "Item name is required"),
  quantity: z.number().min(0.1, "Quantity must be greater than zero"),
  unit_price: z.number().min(0.01, "Price must be positive"),
  total_price: z.number().min(0.01, "Total must be positive")
}))
,
  total_amount: z.number().min(0.01, "Total amount must be positive")
})

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderFormSchema>

interface PurchaseOrderFormProps {
  form: UseFormReturn<PurchaseOrderFormValues>
  inventoryItems: InventoryItem[]
  onCancel: () => void
}

export function PurchaseOrderForm({
  form,
  inventoryItems,
  onCancel
}: PurchaseOrderFormProps) {
  const dispatch = useAppDispatch();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const { fields, append } = useFieldArray({
    control: form.control,
    name: "items"
  });

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/suppliers');
        const data = await response.json();
        setSuppliers(data.data || []);
      } catch (error) {
        console.error("Failed to fetch suppliers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

const onSubmit = async (data: PurchaseOrderFormValues) => {
  try {
    // Get the latest form values to ensure we have everything
    const formValues = form.getValues();
    
    // Calculate item totals
    const itemsWithTotals = formValues.items.map(item => ({
      ...item,
      total_price: item.quantity * item.unit_price
    }));

    const total_amount = itemsWithTotals.reduce(
      (acc, item) => acc + item.total_price, 
      0
    );

    const payload = {
      supplierId: formValues.supplierId,
      supplier_name: formValues.supplier_name,
      orderDate: formValues.orderDate,
      status: formValues.status,
      createdBy: "684c0169fe1f57f65fa60f8b",
      updated_at: new Date().toISOString(),
      items: itemsWithTotals,
      total_amount
    };

    console.log("Submitting payload:", payload);
    await dispatch(createPurchaseOrder(payload));
    console.log("Purchase order created!");
  } catch (error) {
    console.error("Error creating purchase order:", error);
  }
};
  const handleSupplierChange = (value: string) => {
    const selectedSupplier = suppliers.find(s => s._id === value);
    form.setValue('supplierId', value);
    form.setValue('supplier_name', selectedSupplier?.name || "");
  };
const updateOrderTotal = () => {
  const items = form.getValues('items');
  const total = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  form.setValue('total_amount', total);
};
const handleItemChange = (index: number, itemId: string) => {
  const selectedItem = inventoryItems.find(item => item.id === itemId);
  if (!selectedItem) return;

  const quantity = form.getValues(`items.${index}.quantity`) || 1;
  const unit_price = selectedItem.costPerUnit || 0;

  form.setValue(`items.${index}.itemId`, itemId);
  form.setValue(`items.${index}.item_name`, selectedItem.name);
  form.setValue(`items.${index}.quantity`, quantity);
  form.setValue(`items.${index}.unit_price`, unit_price);
  form.setValue(`items.${index}.total_price`, unit_price * quantity);

  updateOrderTotal();
};

const handlePriceChange = (index: number, value: string) => {
  const unitPrice = parseFloat(value) || 0;
  const currentQuantity = form.getValues(`items.${index}.quantity`);
  
  // Update the total price
  form.setValue(
    `items.${index}.total_price`, 
    unitPrice * currentQuantity
  );
  
  // Recalculate the overall total amount
  const items = form.getValues('items');
  const newTotalAmount = items.reduce(
    (sum, item) => sum + (item.quantity * (item.itemId === items[index].itemId ? unitPrice : item.unit_price)),
    0
  );
  form.setValue('total_amount', newTotalAmount);
};
  return (
    <Form {...form}>
<form
  onSubmit={form.handleSubmit(onSubmit, (errors) => {
    console.error("Validation errors:", errors);
  })}
  className="space-y-4"
>

    <FormField
  control={form.control}
  name="supplierId"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Supplier</FormLabel>
      <Select 
        onValueChange={handleSupplierChange}
        value={field.value}
        disabled={loading}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder={loading ? "Loading suppliers..." : "Select supplier"} />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {suppliers.map(supplier => (
            <SelectItem key={supplier._id} value={supplier._id}>
              {supplier.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>


        {/* Order Date */}
        <FormField
          control={form.control}
          name="orderDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order Date</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  {...field} 
                  value={field.value || new Date().toISOString().split('T')[0]}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value || "pending"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Items Array */}
        <div className="space-y-4">
          <h3 className="font-medium">Items</h3>
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-4 gap-2 border p-2 rounded-md">
              {/* Item Selection */}
          <FormField
  control={form.control}
  name={`items.${index}.itemId`}
  render={({ field }) => (
    <FormItem>
      <FormLabel>Item</FormLabel>
      <Select 
        onValueChange={(value) => {
          // Call both the original field.onChange and your custom handler
          field.onChange(value);
          handleItemChange(index, value);
        }}
        value={field.value}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select item" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {inventoryItems.map(item => (
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

              {/* Quantity */}
              <FormField
                control={form.control}
                name={`items.${index}.quantity`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.1"
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          field.onChange(value);
                          // Update total price when quantity changes
                          const unitPrice = form.getValues(`items.${index}.unit_price`);
                          form.setValue(`items.${index}.total_price`, value * unitPrice);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

       {/* Unit Price */}
<FormField
  control={form.control}
  name={`items.${index}.unit_price`}
  render={({ field }) => (
    <FormItem>
      <FormLabel>Unit Price</FormLabel>
      <FormControl>
        <Input
          type="number"
          step="0.01"
          min="0.01"
          {...field}
          value={field.value || ''}  // Ensure controlled value
          onChange={(e) => {
            // Parse the input to number
            const value = parseFloat(e.target.value);
            // Update form field with number or 0 if invalid
            field.onChange(isNaN(value) ? 0 : value);
            // Update total price calculation
            handlePriceChange(index, e.target.value);
          }}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
              {/* Total Price (read-only) */}
              <FormField
                control={form.control}
                name={`items.${index}.total_price`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        readOnly
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => append({ 
  itemId: "", 
  item_name: "",
  quantity: 1, 
  unit_price: 0,
  total_price: 0 
})}

          >
            Add Item
          </Button>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Order</Button>
        </div>
      </form>
    </Form>
  )
}