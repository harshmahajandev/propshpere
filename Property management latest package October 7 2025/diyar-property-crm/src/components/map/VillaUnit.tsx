import React from 'react';

interface VillaUnitProps {
  villa: any;
  isSelected?: boolean;
  isHovered?: boolean;
  batchMode?: boolean;
  statusColor?: string;
  onSelect?: (villa: any) => void;
  onHover?: (villaId: string | null) => void;
  onHoverEnd?: () => void;
  onClick?: (villa: any) => void;
}

const VillaUnit: React.FC<VillaUnitProps> = ({ villa, isSelected, isHovered, batchMode, statusColor, onSelect, onHover, onHoverEnd, onClick }) => {
  const handleClick = () => {
    if (onClick) onClick(villa);
    if (onSelect) onSelect(villa);
  };

  const getStatusColor = () => {
    if (statusColor) return statusColor;
    switch (villa.status) {
      case 'available': return 'bg-green-500';
      case 'reserved': return 'bg-yellow-500';
      case 'sold': return 'bg-red-500';
      case 'under_construction': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div
      className={`w-16 h-16 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected ? 'border-blue-600 scale-110' : 'border-gray-300'
      } ${isHovered ? 'scale-105' : ''} ${getStatusColor()}`}
      style={{
        position: 'absolute',
        left: villa.position_x || 0,
        top: villa.position_y || 0
      }}
      onClick={handleClick}
      onMouseEnter={() => onHover && onHover(villa.id)}
      onMouseLeave={() => {
        if (onHover) onHover(null);
        if (onHoverEnd) onHoverEnd();
      }}
    >
      <div className="text-white text-xs p-1 font-bold">{villa.unit_number}</div>
    </div>
  );
};

export default VillaUnit;