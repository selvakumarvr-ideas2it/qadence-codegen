import { flexRender, type Table } from '@tanstack/react-table';

interface ITableProps<TData> {
  table: Table<TData>;
  className?: string;
  isTableLoading: boolean;
}

export function Table<TData>({
  table,
  className,
}: ITableProps<TData>) {
  const Header = (
    <thead className="hover:bg-blue-50 overflow-x-auto mt-0.5 sticky top-0 bg-white z-10">
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <th
              key={header.id}
              className="
              py-3 px-4 text-left align-middle font-medium text-gray-500
              border-b border-gray-200 text-sm
            "
            >
              {header.isPlaceholder
                ? null
                : flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
            </th>
          ))}
        </tr>
      ))}
    </thead>
  );

  const Body = (
    <tbody>
      {table.getRowModel().rows.map((row) => (
        <tr
          key={row.id}
          className="hover:bg-blue-50 border-b border-gray-200 last:border-b-0"
        >
          {row.getVisibleCells().map((cell) => (
            <td
              key={cell.id}
              className="px-4 py-3 text-sm font-normal text-gray-950"
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );

  return (
    <div className={className}>
      <div className="overflow-x-auto px-6 p-4 ">
        <table className="min-w-full">
          {Header}
          {Body}
        </table>
      </div>
    </div>
  );
}
