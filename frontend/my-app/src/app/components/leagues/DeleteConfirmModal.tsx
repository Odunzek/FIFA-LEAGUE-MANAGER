import React from 'react';

interface DeleteConfirmModalProps {
  leagueName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({ leagueName, onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
            Delete League?
          </h3>
          <p className="text-gray-600 text-center mb-6">
            This will permanently delete the league &quot;{leagueName}&quot; and all its teams, matches, and history. This action cannot be undone.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded font-medium transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium transition-colors duration-150"
            >
              Delete League
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}