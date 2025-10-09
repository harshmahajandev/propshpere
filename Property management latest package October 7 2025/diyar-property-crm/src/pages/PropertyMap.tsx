import React from 'react';
import InteractiveMap from '../components/InteractiveMap';

const PropertyMap: React.FC = () => {
  const handleUnitSelect = (unit: any) => {
    console.log('Selected unit:', unit);
    // Here you could trigger additional actions like opening a detailed view
    // or updating a separate component with the unit details
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Property Map</h1>
          <p className="text-gray-600">Interactive map showing all Diyar islands and property units</p>
        </div>
        
        <InteractiveMap onUnitSelect={handleUnitSelect} />
      </div>
    </div>
  );
};

export default PropertyMap;