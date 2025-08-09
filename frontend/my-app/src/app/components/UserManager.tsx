"use client";

import { useState, useEffect } from "react";
import { createUser, getUsers, updateUser, deleteUser, subscribeToUsers, User } from "../../lib/userUtils";

// Toast notification component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => (
  <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-500 backdrop-blur-sm ${
    type === 'success' ? 'bg-green-500/90 text-white' : 
    type === 'error' ? 'bg-red-500/90 text-white' : 
    'bg-blue-500/90 text-white'
  }`}>
    <div className="flex items-center space-x-3">
      <span className="text-xl">
        {type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
      </span>
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-4 text-white hover:text-gray-200 font-bold">×</button>
    </div>
  </div>
);

interface UserFormData {
  name: string;
  email: string;
  position: string;
  team: string;
}

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    position: '',
    team: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<UserFormData>>({});

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load users and setup real-time listener
  useEffect(() => {
    setIsLoaded(true);
    
    // Setup real-time listener for users
    const unsubscribe = subscribeToUsers((updatedUsers) => {
      setUsers(updatedUsers);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  // Clear form errors after 3 seconds
  useEffect(() => {
    if (Object.keys(formErrors).length > 0) {
      const timer = setTimeout(() => setFormErrors({}), 3000);
      return () => clearTimeout(timer);
    }
  }, [formErrors]);

  // Validate form data
  const validateForm = (): boolean => {
    const errors: Partial<UserFormData> = {};
    
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    // Check for duplicate name (excluding current user when editing)
    const duplicateUser = users.find(user => 
      user.name.toLowerCase() === formData.name.trim().toLowerCase() && 
      user.id !== editingUser?.id
    );
    if (duplicateUser) {
      errors.name = "A user with this name already exists";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (editingUser) {
        // Update existing user
        await updateUser(editingUser.id!, {
          name: formData.name.trim(),
          email: formData.email.trim() || undefined,
          position: formData.position.trim() || undefined,
          team: formData.team.trim() || undefined
        });
        showToast(`${formData.name} updated successfully!`, 'success');
        setEditingUser(null);
      } else {
        // Create new user
        await createUser({
          name: formData.name.trim(),
          email: formData.email.trim() || undefined,
          position: formData.position.trim() || undefined,
          team: formData.team.trim() || undefined,
          isActive: true
        });
        showToast(`${formData.name} added successfully!`, 'success');
        setShowAddForm(false);
      }
      
      // Reset form
      setFormData({ name: '', email: '', position: '', team: '' });
      setFormErrors({});
    } catch (error) {
      console.error('Error saving user:', error);
      showToast('Failed to save user', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit user
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email || '',
      position: user.position || '',
      team: user.team || ''
    });
    setShowAddForm(false);
    setFormErrors({});
  };

  // Handle delete user
  const handleDeleteUser = async (user: User) => {
    if (!user.id) return;
    
    setIsLoading(true);
    try {
      await deleteUser(user.id);
      showToast(`${user.name} deleted successfully`, 'success');
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast('Failed to delete user', 'error');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(null);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', position: '', team: '' });
    setFormErrors({});
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.team && user.team.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Generate avatar color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  // Show loading state while data loads
  if (!isLoaded) {
    return (
      <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">User Management</h2>
                <p className="text-white/80 text-sm">Manage players and staff members</p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
              <span className="text-white/80 text-sm font-medium">Total Users:</span>
              <span className="text-white font-bold ml-2">{users.length}</span>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Search and Add User Section */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users by name, email, or team..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-black placeholder:text-gray-400 w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300"
                />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">🔍</span>
              </div>
            </div>
            
            {/* Add User Button */}
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingUser(null);
                setFormData({ name: '', email: '', position: '', team: '' });
                setFormErrors({});
              }}
              disabled={isLoading}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                showAddForm
                  ? 'bg-gray-500 hover:bg-gray-600 text-white'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
              } disabled:opacity-50`}
            >
              <span className="flex items-center space-x-2">
                <span className="text-lg">{showAddForm ? '❌' : '➕'}</span>
                <span>{showAddForm ? 'Cancel' : 'Add User'}</span>
              </span>
            </button>
          </div>

          {/* Add/Edit User Form */}
          {(showAddForm || editingUser) && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <span className="text-xl">{editingUser ? '✏️' : '👤'}</span>
                <span>{editingUser ? 'Edit User' : 'Add New User'}</span>
              </h3>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name Field */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                    }}
                    className={`text-black placeholder:text-gray-400 w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                      formErrors.name
                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                        : 'border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
                    }`}
                    placeholder="Enter full name"
                    disabled={isLoading}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                      <span>❌</span>
                      <span>{formErrors.name}</span>
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (formErrors.email) setFormErrors({ ...formErrors, email: undefined });
                    }}
                    className={`text-black placeholder:text-gray-400 w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                      formErrors.email
                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                        : 'border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
                    }`}
                    placeholder="Enter email (optional)"
                    disabled={isLoading}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                      <span>❌</span>
                      <span>{formErrors.email}</span>
                    </p>
                  )}
                </div>

                {/* Position Field */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Position
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="text-black placeholder:text-gray-400w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300"
                    disabled={isLoading}
                  >
                    <option value="">Select position (optional)</option>
                    <option value="Goalkeeper">Goalkeeper</option>
                    <option value="Defender">Defender</option>
                    <option value="Midfielder">Midfielder</option>
                    <option value="Forward">Forward</option>
                    <option value="Coach">Coach</option>
                    <option value="Manager">Manager</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>

                {/* Team Field */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Team/Club
                  </label>
                  <input
                    type="text"
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                    className="text-black placeholder:text-gray-400 w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300"
                    placeholder="Enter team/club name (optional)"
                    disabled={isLoading}
                  />
                </div>

                {/* Form Buttons */}
                <div className="md:col-span-2 flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading || !formData.name.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{editingUser ? 'Updating...' : 'Adding...'}</span>
                      </div>
                    ) : (
                      <span>{editingUser ? 'Update User' : 'Add User'}</span>
                    )}
                  </button>
                  
                  {editingUser && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Users Grid */}
          {filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="group bg-white border-2 border-gray-100 rounded-xl p-6 hover:border-purple-300 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  {/* User Avatar and Info */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className={`w-12 h-12 ${getAvatarColor(user.name)} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{user.name}</h3>
                      {user.email && (
                        <p className="text-sm text-gray-600 truncate">{user.email}</p>
                      )}
                      {user.position && (
                        <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {user.position}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Team Info */}
                  {user.team && (
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>⚽</span>
                        <span className="font-medium">{user.team}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => handleEditUser(user)}
                      disabled={isLoading}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300 disabled:opacity-50"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(user)}
                      disabled={isLoading}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300 disabled:opacity-50"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <div className="text-8xl mb-6">👥</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {searchTerm ? 'No users found' : 'No users yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? `No users match "${searchTerm}". Try a different search term.`
                  : 'Add your first user to get started!'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                >
                  Add Your First User
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300">
            <div className="p-8">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full">
                <span className="text-3xl">🗑️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
                Delete User?
              </h3>
              <p className="text-gray-600 text-center mb-8 leading-relaxed">
                This will permanently delete <strong>"{showDeleteConfirm.name}"</strong>. This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={isLoading}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteUser(showDeleteConfirm)}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Deleting...</span>
                    </div>
                  ) : (
                    'Delete User'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}