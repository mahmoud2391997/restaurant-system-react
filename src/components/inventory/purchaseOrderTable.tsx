"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, X } from "lucide-react";
import { Button } from "../ui/button";

export function PurchaseOrderTable({
  orders,
  inventoryItems,
  onEdit,
  onDelete,
}: {
  orders: any[];
  inventoryItems: { id: string; name: string }[];
  onEdit?: (order: any) => void;
  onDelete?: (id: string) => void;
}) {
  return (
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
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.id.slice(0, 8)}</TableCell>
            <TableCell>{order.supplier_name}</TableCell>
            <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
            <TableCell>
              <div className="space-y-1">
                {order.items.map((item: any, i: number) => {
                  const itemName =
                    inventoryItems.find((i) => i.id === item.item_id)?.name || item.item_id;
                  return (
                    <div key={i} className="text-sm">
                      {itemName} - {item.quantity} @ ${item.unit_price.toFixed(2)}
                    </div>
                  );
                })}
              </div>
            </TableCell>
            <TableCell>${order.total_amount?.toFixed(2) || "0.00"}</TableCell>
            <TableCell>
              <Badge
                variant={
                  order.status === "received"
                    ? "default"
                    : order.status === "cancelled"
                    ? "destructive"
                    : "secondary"
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
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(order)}>Edit</DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDelete(order.id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}