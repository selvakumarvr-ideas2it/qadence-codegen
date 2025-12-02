import EditIcon from '@/assets/icons/EditIcon.svg?react';
import useGetAllUsers from '@/hooks/useGetAllUsers';
import type { IUserDetails } from '@/interfaces/User';
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo } from 'react';
import SecondaryButton from '../shared/buttons/SecondaryButton';
import { Table } from '../shared/table/table';

type IUserRow = {
  name: string;
  email: string;
  role: string;
  clientName: string;
  applications: string[];
  __raw: IUserDetails;
};

type IUserTableViewProps = {
  page: number;
  onEdit?: (row: IUserDetails) => void;
};

const columnHelper = createColumnHelper<IUserRow>();

export function UserTableView({ page, onEdit }: IUserTableViewProps) {
  const { data: apiData, isLoading, error } = useGetAllUsers(page);

  const rows = useMemo<IUserRow[]>(() => {
    if (!apiData) return [];

    const isArray = Array.isArray(apiData);
    const hasData =
      !isArray &&
      typeof apiData === 'object' &&
      apiData !== null &&
      'data' in apiData &&
      Array.isArray((apiData as { data: IUserDetails[] }).data);
    const hasContent =
      !isArray &&
      typeof apiData === 'object' &&
      apiData !== null &&
      'content' in apiData &&
      Array.isArray((apiData as { content: IUserDetails[] }).content);

    const list: IUserDetails[] = isArray
      ? (apiData as IUserDetails[])
      : hasData
        ? (apiData as { data: IUserDetails[] }).data
        : hasContent
          ? (apiData as { content: IUserDetails[] }).content
          : [];

    return list.map((u) => {
      const name = u.userName;
      const email = u.email;
      const role = u.roleName;
      const clientName = u.tenantName;
      const applications: string[] = Array.isArray(u.applications)
        ? u.applications.map((app) => app.applicationName).filter(Boolean)
        : [];

      return {
        name,
        email,
        role,
        clientName,
        applications,
        __raw: u,
      };
    });
  }, [apiData]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => (
          <span className="font-semibold">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('role', {
        header: 'Role',
        cell: (info) => {
          const colors = [
            { bg: 'bg-gray-100', text: 'text-gray-600' },
            { bg: 'bg-blue-100', text: 'text-blue-600' },
            { bg: 'bg-green-100', text: 'text-green-600' },
            { bg: 'bg-purple-100', text: 'text-purple-600' },
          ];
          const idx = info.row.index % colors.length;
          const { bg, text } = colors[idx];
          return (
            <span
              className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${bg} ${text}`}
            >
              {info.getValue()}
            </span>
          );
        },
      }),
      columnHelper.accessor('clientName', {
        header: 'Client Name',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('applications', {
        header: 'Applications',
        cell: (info) => {
          const applications = info.getValue();
          const maxDisplay = 2;
          const maxChars = 10;

          const truncateText = (text: string) => {
            return text.length > maxChars
              ? text.substring(0, maxChars) + '...'
              : text;
          };

          return (
            <div className="flex flex-wrap gap-1">
              {applications.slice(0, maxDisplay).map((app, index) => (
                <div
                  key={index}
                  className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md font-semibold"
                  title={app}
                >
                  {truncateText(app)}
                </div>
              ))}
              {applications.length > maxDisplay && (
                <div
                  className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md"
                  title={`${applications.slice(maxDisplay).join(', ')}`}
                >
                  +{applications.length - maxDisplay}
                </div>
              )}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Action',
        cell: (info) => (
          <div className="flex gap-2">
            <SecondaryButton
              className="px-2.5 py-1 border-gray-300 rounded-md text-sm"
              aria-label={`Edit ${info.row.original.name}`}
              onClick={() => onEdit?.(info.row.original.__raw)}
            >
              <EditIcon className="w-3.5 h-3.5 mr-2" />
              Edit
            </SecondaryButton>
          </div>
        ),
      }),
    ],
    [onEdit]
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="pb-6">
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="mx-6 mb-3 rounded-md border border-red-200 bg-red-50 text-red-700 px-4 py-2 text-sm"
        >
          Failed to load users. Please try again.
        </div>
      )}
      <Table
        table={table}
        className="bg-white rounded-lg shadow-sm"
        isTableLoading={!!isLoading}
      />
      {isLoading && (
        <div aria-live="polite" className="px-6 py-3 text-sm text-gray-500">
          Loading users...
        </div>
      )}
      {!isLoading && rows.length === 0 && !error && (
        <div aria-live="polite" className="px-6 py-3 text-sm text-gray-500">
          No users found.
        </div>
      )}
    </div>
  );
}
