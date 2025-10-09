import React, { useState } from 'react';
import { X } from 'lucide-react';

interface QuickRegistrationModalProps {
  villa: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
  onRegistrationComplete?: (registration: any) => void;
}

const QuickRegistrationModal: React.FC<QuickRegistrationModalProps> = ({ villa, isOpen, onClose, onSubmit, onRegistrationComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  if (!isOpen || !villa) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const registrationData = {
      ...formData,
      villa_id: villa.id,
      villa_unit_number: villa.unit_number
    };
    
    if (onSubmit) {
      onSubmit(registrationData);
    }
    if (onRegistrationComplete) {
      onRegistrationComplete(registrationData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Register Interest - Villa {villa.unit_number}</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              className="w-full border border-gray-300 rounded px-3 py-2"
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
            />
          </div>
          
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Submit Registration
            </button>
            <button type="button" onClick={onClose} className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickRegistrationModal;