import React from 'react';
import { X } from 'lucide-react';

interface VillaDetailsModalProps {
  villa: any;
  isOpen: boolean;
  onClose: () => void;
  onQuickRegister?: (villa: any) => void;
  onQuickRegistration?: () => void;
  onStatusUpdate?: (villaId: string, newStatus: string) => void;
}

const VillaDetailsModal: React.FC<VillaDetailsModalProps> = ({ villa, isOpen, onClose, onQuickRegister, onQuickRegistration, onStatusUpdate }) => {
  if (!isOpen || !villa) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Villa {villa.unit_number}</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-2">
          <p><strong>Status:</strong> {villa.status}</p>
          <p><strong>Price:</strong> ${villa.price?.toLocaleString()}</p>
          <p><strong>Bedrooms:</strong> {villa.bedrooms}</p>
          <p><strong>Bathrooms:</strong> {villa.bathrooms}</p>
          <p><strong>Size:</strong> {villa.size_sqft} sqft</p>
          <p><strong>Project:</strong> {villa.project}</p>
        </div>
        
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => {
              if (onQuickRegistration) onQuickRegistration();
              else if (onQuickRegister) onQuickRegister(villa);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Quick Register Interest
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VillaDetailsModal;