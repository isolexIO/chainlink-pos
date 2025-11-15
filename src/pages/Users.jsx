import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import UserList from '../components/users/UserList';
import UserForm from '../components/users/UserForm';
import PermissionGate from '../components/PermissionGate';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get current user's merchant_id
      const pinUserJSON = localStorage.getItem('pinLoggedInUser');
      let currentUser;
      if (pinUserJSON) {
        currentUser = JSON.parse(pinUserJSON);
      } else {
        currentUser = await base44.auth.me();
      }

      // Load users for this merchant
      let userList;
      if (currentUser.role === 'admin' && !currentUser.is_impersonating) {
        // Super admin sees all users
        userList = await base44.entities.User.list();
      } else if (currentUser.merchant_id) {
        // Merchant users see only their merchant's users
        userList = await base44.entities.User.filter({ merchant_id: currentUser.merchant_id });
      } else {
        userList = [];
      }
      
      setUsers(userList);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSaveUser = async (userData) => {
    try {
      // Get current user's merchant_id to assign to new users
      const pinUserJSON = localStorage.getItem('pinLoggedInUser');
      let currentUser;
      if (pinUserJSON) {
        currentUser = JSON.parse(pinUserJSON);
      } else {
        currentUser = await base44.auth.me();
      }

      // Ensure merchant_id is set for new users
      if (!selectedUser && currentUser.merchant_id) {
        userData.merchant_id = currentUser.merchant_id;
      }

      if (selectedUser) {
        await base44.entities.User.update(selectedUser.id, userData);
      } else {
        await base44.entities.User.create(userData);
      }
      loadUsers();
      setIsFormOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user. Please make sure all required fields are filled correctly.');
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleAddNewUser = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await base44.entities.User.delete(userId);
        loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user.');
      }
    }
  };

  return (
    <PermissionGate permission="manage_users">
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">User Management</h1>
            <Button onClick={handleAddNewUser}>
              <Plus className="w-4 h-4 mr-2" /> Add New User
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User List ({users.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading users...</p>
                </div>
              ) : (
                <UserList
                  users={users}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                />
              )}
            </CardContent>
          </Card>

          {isFormOpen && (
            <UserForm
              user={selectedUser}
              onSave={handleSaveUser}
              onCancel={() => {
                setIsFormOpen(false);
                setSelectedUser(null);
              }}
            />
          )}
        </div>
      </div>
    </PermissionGate>
  );
}