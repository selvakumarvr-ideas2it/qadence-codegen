import { UserAccountView } from '@/components/user-account/UserAccountView';

export function UserAccount() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-8 pt-5">
        <UserAccountView />
      </div>
    </div>
  );
}
