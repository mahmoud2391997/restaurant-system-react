"use client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { InventoryItem } from '../../types/entities'; // adjust the path to where your interface is

type Props = {
  data: InventoryItem[];
};

const columns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'unit',
    header: 'Unit',
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    accessorKey: 'currentStock',
    header: 'Current Stock',
  },
  {
    accessorKey: 'minimumStock',
    header: 'Min Stock',
  },
  {
    accessorKey: 'costPerUnit',
    header: 'Cost/Unit',
  },
  {
    accessorKey: 'locked',
    header: 'Locked',
    cell: info => (info.getValue() ? 'Yes' : 'No'),
  },
  {
    accessorKey: 'category',
    header: 'Category',
  },
  {
    accessorKey: 'supplier',
    header: 'Supplier',
  },
  {
    accessorKey: 'lastUpdated',
    header: 'Last Updated',
  },
];

const InventoryTable: React.FC<Props> = ({ data }) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className="min-w-full border border-gray-300 text-sm">
      <thead>
        {table.getHeaderGroups().map(headerGroup => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <th key={header.id} className="border p-2 bg-gray-100">
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map(row => (
          <tr key={row.id}>
            {row.getVisibleCells().map(cell => (
              <td key={cell.id} className="border p-2">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default InventoryTable;
