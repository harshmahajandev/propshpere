import React, { useState, useEffect } from 'react';
import { masterDataAPI, auditAPI } from '../../lib/adminAPI';
import { useIslands, useProjects } from '../../hooks/useData';

interface MasterDataFormsProps {
  activeForm: string;
  onFormSubmit: (data: any) => void;
}

const MasterDataForms: React.FC<MasterDataFormsProps> = ({ activeForm, onFormSubmit }) => {
  const { islands } = useIslands();
  const { projects } = useProjects();
  
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    switch (activeForm) {
      case 'property-registration':
        if (!formData.property_title) newErrors.property_title = 'Property title is required';
        if (!formData.property_type) newErrors.property_type = 'Property type is required';
        if (!formData.built_up_area) newErrors.built_up_area = 'Built-up area is required';
        break;
      case 'property-value':
        if (!formData.property_type) newErrors.property_type = 'Property type is required';
        if (!formData.base_price_per_sqm) newErrors.base_price_per_sqm = 'Base price is required';
        if (!formData.effective_from) newErrors.effective_from = 'Effective date is required';
        break;
      case 'cost-sheet':
        if (!formData.cost_category) newErrors.cost_category = 'Cost category is required';
        if (!formData.cost_item) newErrors.cost_item = 'Cost item is required';
        if (!formData.unit_cost) newErrors.unit_cost = 'Unit cost is required';
        break;
      case 'payment-milestone':
        if (!formData.milestone_name) newErrors.milestone_name = 'Milestone name is required';
        if (!formData.payment_percentage) newErrors.payment_percentage = 'Payment percentage is required';
        if (!formData.milestone_order) newErrors.milestone_order = 'Milestone order is required';
        break;
      case 'customer-type':
        if (!formData.customer_type) newErrors.customer_type = 'Customer type is required';
        if (!formData.priority_level) newErrors.priority_level = 'Priority level is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      let result;
      
      switch (activeForm) {
        case 'property-registration':
          result = await masterDataAPI.createPropertyRegistration({
            ...formData,
            registration_status: 'SUBMITTED'
          });
          await auditAPI.logAction('CREATE', 'PROPERTY_REGISTRATION', result.id, null, formData);
          break;
        case 'property-value':
          result = await masterDataAPI.createPropertyValueMaster(formData);
          await auditAPI.logAction('CREATE', 'PROPERTY_VALUE_MASTER', result.id, null, formData);
          break;
        case 'cost-sheet':
          result = await masterDataAPI.createCostSheetMaster(formData);
          await auditAPI.logAction('CREATE', 'COST_SHEET_MASTER', result.id, null, formData);
          break;
        case 'payment-milestone':
          result = await masterDataAPI.createPaymentMilestoneMaster(formData);
          await auditAPI.logAction('CREATE', 'PAYMENT_MILESTONE_MASTER', result.id, null, formData);
          break;
        case 'customer-type':
          result = await masterDataAPI.createCustomerTypeMaster(formData);
          await auditAPI.logAction('CREATE', 'CUSTOMER_TYPE_MASTER', result.id, null, formData);
          break;
      }
      
      onFormSubmit(result);
      setFormData({});
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPropertyRegistrationForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Title *
          </label>
          <input
            type="text"
            value={formData.property_title || ''}
            onChange={(e) => handleInputChange('property_title', e.target.value)}
            className={`w-full p-3 border rounded-lg ${errors.property_title ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter property title"
          />
          {errors.property_title && <p className="text-red-500 text-sm mt-1">{errors.property_title}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Type *
          </label>
          <select
            value={formData.property_type || ''}
            onChange={(e) => handleInputChange('property_type', e.target.value)}
            className={`w-full p-3 border rounded-lg ${errors.property_type ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select property type</option>
            <option value="Villa">Villa</option>
            <option value="Townhouse">Townhouse</option>
            <option value="Apartment">Apartment</option>
            <option value="Commercial">Commercial</option>
            <option value="Plot">Plot</option>
          </select>
          {errors.property_type && <p className="text-red-500 text-sm mt-1">{errors.property_type}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Island
          </label>
          <select
            value={formData.island_id || ''}
            onChange={(e) => handleInputChange('island_id', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="">Select island</option>
            {islands.map(island => (
              <option key={island.id} value={island.id}>{island.display_name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project
          </label>
          <select
            value={formData.project_id || ''}
            onChange={(e) => handleInputChange('project_id', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="">Select project</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.display_name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plot Number
          </label>
          <input
            type="text"
            value={formData.plot_number || ''}
            onChange={(e) => handleInputChange('plot_number', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Enter plot number"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Built-up Area (sqm) *
          </label>
          <input
            type="number"
            value={formData.built_up_area || ''}
            onChange={(e) => handleInputChange('built_up_area', parseFloat(e.target.value))}
            className={`w-full p-3 border rounded-lg ${errors.built_up_area ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter built-up area"
          />
          {errors.built_up_area && <p className="text-red-500 text-sm mt-1">{errors.built_up_area}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Land Area (sqm)
          </label>
          <input
            type="number"
            value={formData.land_area || ''}
            onChange={(e) => handleInputChange('land_area', parseFloat(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Enter land area"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bedrooms
          </label>
          <input
            type="number"
            value={formData.bedrooms || ''}
            onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Number of bedrooms"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bathrooms
          </label>
          <input
            type="number"
            value={formData.bathrooms || ''}
            onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Number of bathrooms"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Parking Spaces
          </label>
          <input
            type="number"
            value={formData.parking_spaces || ''}
            onChange={(e) => handleInputChange('parking_spaces', parseInt(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Number of parking spaces"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site Map URL
          </label>
          <input
            type="url"
            value={formData.site_map_url || ''}
            onChange={(e) => handleInputChange('site_map_url', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Enter site map URL"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Floor Plan URL
          </label>
          <input
            type="url"
            value={formData.floor_plan_url || ''}
            onChange={(e) => handleInputChange('floor_plan_url', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Enter floor plan URL"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amenities
        </label>
        <input
          type="text"
          value={formData.amenities_text || ''}
          onChange={(e) => handleInputChange('amenities', e.target.value.split(',').map(a => a.trim()))}
          className="w-full p-3 border border-gray-300 rounded-lg"
          placeholder="Enter amenities separated by commas"
        />
      </div>
    </div>
  );

  const renderPropertyValueForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Type *
          </label>
          <select
            value={formData.property_type || ''}
            onChange={(e) => handleInputChange('property_type', e.target.value)}
            className={`w-full p-3 border rounded-lg ${errors.property_type ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select property type</option>
            <option value="Villa">Villa</option>
            <option value="Townhouse">Townhouse</option>
            <option value="Apartment">Apartment</option>
            <option value="Commercial">Commercial</option>
            <option value="Plot">Plot</option>
          </select>
          {errors.property_type && <p className="text-red-500 text-sm mt-1">{errors.property_type}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Size Category
          </label>
          <select
            value={formData.size_category || ''}
            onChange={(e) => handleInputChange('size_category', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="">Select size category</option>
            <option value="Small">Small (0-200 sqm)</option>
            <option value="Medium">Medium (200-400 sqm)</option>
            <option value="Large">Large (400-600 sqm)</option>
            <option value="Extra Large">Extra Large (600+ sqm)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Base Price per SQM (BHD) *
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.base_price_per_sqm || ''}
            onChange={(e) => handleInputChange('base_price_per_sqm', parseFloat(e.target.value))}
            className={`w-full p-3 border rounded-lg ${errors.base_price_per_sqm ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter base price per SQM"
          />
          {errors.base_price_per_sqm && <p className="text-red-500 text-sm mt-1">{errors.base_price_per_sqm}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Market Factor
          </label>
          <input
            type="number"
            step="0.0001"
            value={formData.market_factor || 1.0000}
            onChange={(e) => handleInputChange('market_factor', parseFloat(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Enter market factor (default: 1.0000)"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Island
          </label>
          <select
            value={formData.island_id || ''}
            onChange={(e) => handleInputChange('island_id', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="">Select island (optional)</option>
            {islands.map(island => (
              <option key={island.id} value={island.id}>{island.display_name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project
          </label>
          <select
            value={formData.project_id || ''}
            onChange={(e) => handleInputChange('project_id', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="">Select project (optional)</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.display_name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Effective From *
          </label>
          <input
            type="date"
            value={formData.effective_from || ''}
            onChange={(e) => handleInputChange('effective_from', e.target.value)}
            className={`w-full p-3 border rounded-lg ${errors.effective_from ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.effective_from && <p className="text-red-500 text-sm mt-1">{errors.effective_from}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Effective To
          </label>
          <input
            type="date"
            value={formData.effective_to || ''}
            onChange={(e) => handleInputChange('effective_to', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
    </div>
  );

  const renderCostSheetForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cost Category *
          </label>
          <select
            value={formData.cost_category || ''}
            onChange={(e) => handleInputChange('cost_category', e.target.value)}
            className={`w-full p-3 border rounded-lg ${errors.cost_category ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select cost category</option>
            <option value="Construction">Construction</option>
            <option value="Legal">Legal</option>
            <option value="Marketing">Marketing</option>
            <option value="Administrative">Administrative</option>
            <option value="Utilities">Utilities</option>
            <option value="Infrastructure">Infrastructure</option>
          </select>
          {errors.cost_category && <p className="text-red-500 text-sm mt-1">{errors.cost_category}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cost Item *
          </label>
          <input
            type="text"
            value={formData.cost_item || ''}
            onChange={(e) => handleInputChange('cost_item', e.target.value)}
            className={`w-full p-3 border rounded-lg ${errors.cost_item ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter cost item description"
          />
          {errors.cost_item && <p className="text-red-500 text-sm mt-1">{errors.cost_item}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unit Cost (BHD) *
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.unit_cost || ''}
            onChange={(e) => handleInputChange('unit_cost', parseFloat(e.target.value))}
            className={`w-full p-3 border rounded-lg ${errors.unit_cost ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter unit cost"
          />
          {errors.unit_cost && <p className="text-red-500 text-sm mt-1">{errors.unit_cost}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cost Type *
          </label>
          <select
            value={formData.cost_type || ''}
            onChange={(e) => handleInputChange('cost_type', e.target.value)}
            className={`w-full p-3 border rounded-lg ${errors.cost_type ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select cost type</option>
            <option value="FIXED">Fixed</option>
            <option value="VARIABLE">Variable</option>
            <option value="PERCENTAGE">Percentage</option>
          </select>
          {errors.cost_type && <p className="text-red-500 text-sm mt-1">{errors.cost_type}</p>}
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Applicable Property Types
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {['Villa', 'Townhouse', 'Apartment', 'Commercial', 'Plot'].map(type => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.applicable_property_types?.includes(type) || false}
                  onChange={(e) => {
                    const current = formData.applicable_property_types || [];
                    if (e.target.checked) {
                      handleInputChange('applicable_property_types', [...current, type]);
                    } else {
                      handleInputChange('applicable_property_types', current.filter(t => t !== type));
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm">{type}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_mandatory || false}
              onChange={(e) => handleInputChange('is_mandatory', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">Mandatory Cost Item</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderPaymentMilestoneForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Milestone Name *
          </label>
          <input
            type="text"
            value={formData.milestone_name || ''}
            onChange={(e) => handleInputChange('milestone_name', e.target.value)}
            className={`w-full p-3 border rounded-lg ${errors.milestone_name ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter milestone name"
          />
          {errors.milestone_name && <p className="text-red-500 text-sm mt-1">{errors.milestone_name}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Milestone Order *
          </label>
          <input
            type="number"
            value={formData.milestone_order || ''}
            onChange={(e) => handleInputChange('milestone_order', parseInt(e.target.value))}
            className={`w-full p-3 border rounded-lg ${errors.milestone_order ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter milestone order (1, 2, 3...)"
          />
          {errors.milestone_order && <p className="text-red-500 text-sm mt-1">{errors.milestone_order}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Percentage *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.payment_percentage || ''}
            onChange={(e) => handleInputChange('payment_percentage', parseFloat(e.target.value))}
            className={`w-full p-3 border rounded-lg ${errors.payment_percentage ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter percentage (0-100)"
          />
          {errors.payment_percentage && <p className="text-red-500 text-sm mt-1">{errors.payment_percentage}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Days from Booking
          </label>
          <input
            type="number"
            value={formData.days_from_booking || 0}
            onChange={(e) => handleInputChange('days_from_booking', parseInt(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Days from booking (default: 0)"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Milestone Description
          </label>
          <textarea
            value={formData.milestone_description || ''}
            onChange={(e) => handleInputChange('milestone_description', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
            rows={3}
            placeholder="Enter milestone description"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Applicable Property Types
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {['Villa', 'Townhouse', 'Apartment', 'Commercial', 'Plot'].map(type => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.property_types?.includes(type) || false}
                  onChange={(e) => {
                    const current = formData.property_types || [];
                    if (e.target.checked) {
                      handleInputChange('property_types', [...current, type]);
                    } else {
                      handleInputChange('property_types', current.filter(t => t !== type));
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm">{type}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_default || false}
              onChange={(e) => handleInputChange('is_default', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">Default Milestone</span>
          </label>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project (Optional)
          </label>
          <select
            value={formData.project_id || ''}
            onChange={(e) => handleInputChange('project_id', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="">All projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.display_name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderCustomerTypeForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Type *
          </label>
          <input
            type="text"
            value={formData.customer_type || ''}
            onChange={(e) => handleInputChange('customer_type', e.target.value)}
            className={`w-full p-3 border rounded-lg ${errors.customer_type ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter customer type name"
          />
          {errors.customer_type && <p className="text-red-500 text-sm mt-1">{errors.customer_type}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority Level *
          </label>
          <select
            value={formData.priority_level || ''}
            onChange={(e) => handleInputChange('priority_level', parseInt(e.target.value))}
            className={`w-full p-3 border rounded-lg ${errors.priority_level ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select priority level</option>
            <option value="1">1 - Highest Priority</option>
            <option value="2">2 - High Priority</option>
            <option value="3">3 - Normal Priority</option>
            <option value="4">4 - Low Priority</option>
            <option value="5">5 - Lowest Priority</option>
          </select>
          {errors.priority_level && <p className="text-red-500 text-sm mt-1">{errors.priority_level}</p>}
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Description
          </label>
          <textarea
            value={formData.customer_description || ''}
            onChange={(e) => handleInputChange('customer_description', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
            rows={3}
            placeholder="Enter customer type description"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Eligibility Criteria (JSON format)
          </label>
          <textarea
            value={formData.eligibility_criteria_text || ''}
            onChange={(e) => {
              handleInputChange('eligibility_criteria_text', e.target.value);
              try {
                const parsed = JSON.parse(e.target.value || '{}');
                handleInputChange('eligibility_criteria', parsed);
              } catch (err) {
                // Invalid JSON, keep text but don't update object
              }
            }}
            className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm"
            rows={4}
            placeholder='{"minIncome": 5000, "residencyStatus": "resident"}'
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Benefits (JSON format)
          </label>
          <textarea
            value={formData.default_benefits_text || ''}
            onChange={(e) => {
              handleInputChange('default_benefits_text', e.target.value);
              try {
                const parsed = JSON.parse(e.target.value || '{}');
                handleInputChange('default_benefits', parsed);
              } catch (err) {
                // Invalid JSON, keep text but don't update object
              }
            }}
            className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm"
            rows={4}
            placeholder='{"discount": 0.05, "paymentTerms": "flexible"}'
          />
        </div>
      </div>
    </div>
  );

  const renderForm = () => {
    switch (activeForm) {
      case 'property-registration':
        return renderPropertyRegistrationForm();
      case 'property-value':
        return renderPropertyValueForm();
      case 'cost-sheet':
        return renderCostSheetForm();
      case 'payment-milestone':
        return renderPaymentMilestoneForm();
      case 'customer-type':
        return renderCustomerTypeForm();
      default:
        return <div className="text-gray-500">Select a form type</div>;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {renderForm()}
      
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={() => setFormData({})}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default MasterDataForms;