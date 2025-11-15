import DepartmentsTab from '../components/settings/DepartmentsTab';
import PermissionGate from '../components/PermissionGate';

export default function DepartmentsPage() {
  return (
    <PermissionGate permission="manage_inventory">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Department Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Organize your products into departments for easier navigation
            </p>
          </div>

          <DepartmentsTab />
        </div>
      </div>
    </PermissionGate>
  );
}