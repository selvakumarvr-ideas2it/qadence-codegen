import UserSettingsIcon from '@/assets/icons/UserSettingsIcon.svg';
import useGetAllUsers from '@/hooks/useGetAllUsers';
import type { IUserDetails } from '@/interfaces/User';
import { cn } from '@/utils/util';
import { useState } from 'react';
import { IconButton } from '../shared/buttons/IconButton';
import PrimaryButton from '../shared/buttons/PrimaryButton';
import { Modal } from '../shared/modal/modal';
import { Pagination } from '../shared/Pagination/Pagination';
import ScrollPanel from '../shared/scrollPanel/ScrollPanel';
import { UserForm } from './UserForm';
import { UserTableView } from './UserTableView';

export function UserAccountView() {
  const [page, setPage] = useState<number>(0);

  const { data: userData, refetch: refetchUsers } = useGetAllUsers(page);

  const totalPages =
    userData && 'totalElements' in userData
      ? Math.max(1, Math.ceil(userData.totalElements / 7))
      : 1;

  const [isCreateUserOpen, setIsCreateUserOpen] = useState<boolean>(false);

  //edit state
  const [isEditUserOpen, setIsEditUserOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<IUserDetails | null>(null);

  const handleCreateUser = () => {
    setIsCreateUserOpen(true);
  };

  const handleUserSubmit = () => {
    setIsCreateUserOpen(false);
  };

  const handleEditFormOpen = (row: IUserDetails) => {
    setSelectedUser(row);
    setIsEditUserOpen(true);
  };

  const handleEditFormSubmit = () => {
    setIsEditUserOpen(false);
    setSelectedUser(null);
  };

  return (
    <>
      <section className="flex items-center justify-between py-4 pb-3">
        <div className="flex gap-4">
          <div className="flex items-center gap-3">
            <IconButton icon={UserSettingsIcon} alt="User Settings" />
            <div className="font-bold text-xl text-nowrap">User Management</div>
          </div>
        </div>
        <div>
          <PrimaryButton
            className={cn(
              `text-sm flex items-center justify-center py-1 px-2.5`
            )}
            onClick={handleCreateUser}
            aria-label="Create a new user"
          >
            <span className="text-lg">+&nbsp;</span> New User
          </PrimaryButton>
        </div>
      </section>
      <section>
        <UserTableView page={page} onEdit={handleEditFormOpen} />
      </section>
      <section className="fixed bottom-5 left-0 w-full py-3 flex justify-center z-10">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </section>

      <Modal
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
        className={cn(`w-full max-w-xl max-h-[85vh] mx-4 !pe-2 !pt-3`)}
      >
        <ScrollPanel className="max-h-[80vh]">
          <UserForm
            mode="create"
            onBack={() => setIsCreateUserOpen(false)}
            initialData={null}
            onSubmit={handleUserSubmit}
            refetchUsers={refetchUsers}
          />
        </ScrollPanel>
      </Modal>

      <Modal
        isOpen={isEditUserOpen}
        onClose={() => setIsEditUserOpen(false)}
        className={cn(`w-full max-w-xl max-h-[85vh] mx-4 !pe-2 !pt-3`)}
      >
        <ScrollPanel className="max-h-[80vh]">
          <UserForm
            mode="edit"
            onBack={() => setIsEditUserOpen(false)}
            userDetails={selectedUser ?? undefined}
            initialData={null}
            onSubmit={handleEditFormSubmit}
            refetchUsers={refetchUsers}
          />
        </ScrollPanel>
      </Modal>
    </>
  );
}
