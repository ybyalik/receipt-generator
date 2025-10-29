import React from 'react';

interface SectionDefaultsEditorProps {
  sectionType: string;
  data: any;
  onChange: (data: any) => void;
}

const SectionDefaultsEditor: React.FC<SectionDefaultsEditorProps> = ({ sectionType, data, onChange }) => {
  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const renderHeaderFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Business Name</label>
        <input
          type="text"
          value={data.businessName || ''}
          onChange={(e) => handleChange('businessName', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="e.g., Quantum PC Repair"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Address</label>
        <textarea
          value={data.address || ''}
          onChange={(e) => handleChange('address', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 h-20"
          placeholder="e.g., 3420 Innovation Drive&#10;Austin, TX 78758"
        />
        <p className="text-xs text-gray-500 mt-1">Press Enter for new lines</p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Phone</label>
        <input
          type="text"
          value={data.phone || ''}
          onChange={(e) => handleChange('phone', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="e.g., (512) 555-0142"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={data.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="e.g., support@quantumpc.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Website</label>
        <input
          type="text"
          value={data.website || ''}
          onChange={(e) => handleChange('website', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="e.g., www.quantumpc.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Logo URL (optional)</label>
        <input
          type="text"
          value={data.logo || ''}
          onChange={(e) => handleChange('logo', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Leave empty for no logo"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Logo Size (%)</label>
        <input
          type="number"
          value={data.logoSize || 50}
          onChange={(e) => handleChange('logoSize', parseInt(e.target.value))}
          className="w-full border border-gray-300 rounded px-3 py-2"
          min="10"
          max="100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Text Alignment</label>
        <select
          value={data.alignment || 'center'}
          onChange={(e) => handleChange('alignment', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
    </div>
  );

  const renderCustomMessageFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Message Text</label>
        <textarea
          value={data.text || ''}
          onChange={(e) => handleChange('text', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 h-32"
          placeholder="e.g., Thank you for your business!&#10;We appreciate your support."
        />
        <p className="text-xs text-gray-500 mt-1">Press Enter for new lines</p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Text Alignment</label>
        <select
          value={data.alignment || 'center'}
          onChange={(e) => handleChange('alignment', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Font Weight</label>
        <select
          value={data.fontWeight || 'normal'}
          onChange={(e) => handleChange('fontWeight', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="normal">Normal</option>
          <option value="bold">Bold</option>
        </select>
      </div>
    </div>
  );

  const renderItemsListFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Sample Items (one per line)</label>
        <textarea
          value={Array.isArray(data.items) ? data.items.map((item: any) => 
            `${item.name}|${item.quantity}|${item.price}`
          ).join('\n') : ''}
          onChange={(e) => {
            const lines = e.target.value.split('\n');
            const items = lines.map(line => {
              const [name, quantity, price] = line.split('|');
              return {
                name: name || '',
                quantity: quantity || '1',
                price: price || '0.00'
              };
            });
            handleChange('items', items);
          }}
          className="w-full border border-gray-300 rounded px-3 py-2 h-32 font-mono text-sm"
          placeholder="Item Name|Quantity|Price&#10;e.g., SSD Installation|1|89.99"
        />
        <p className="text-xs text-gray-500 mt-1">Format: Name|Quantity|Price (one item per line)</p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Show Quantity Column</label>
        <select
          value={data.showQuantity ? 'true' : 'false'}
          onChange={(e) => handleChange('showQuantity', e.target.value === 'true')}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>
    </div>
  );

  const renderPaymentFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Subtotal</label>
        <input
          type="text"
          value={data.subtotal || '0.00'}
          onChange={(e) => handleChange('subtotal', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="e.g., 89.99"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Tax</label>
        <input
          type="text"
          value={data.tax || '0.00'}
          onChange={(e) => handleChange('tax', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="e.g., 7.42"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Total</label>
        <input
          type="text"
          value={data.total || '0.00'}
          onChange={(e) => handleChange('total', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="e.g., 97.41"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Payment Method</label>
        <input
          type="text"
          value={data.paymentMethod || ''}
          onChange={(e) => handleChange('paymentMethod', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="e.g., Cash, Card, Check"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Text Alignment</label>
        <select
          value={data.alignment || 'right'}
          onChange={(e) => handleChange('alignment', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
    </div>
  );

  const renderDateTimeFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Format</label>
        <select
          value={data.format || 'datetime'}
          onChange={(e) => handleChange('format', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="datetime">Date & Time</option>
          <option value="date">Date Only</option>
          <option value="time">Time Only</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Text Alignment</label>
        <select
          value={data.alignment || 'center'}
          onChange={(e) => handleChange('alignment', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
    </div>
  );

  const renderBarcodeFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Barcode Value</label>
        <input
          type="text"
          value={data.value || ''}
          onChange={(e) => handleChange('value', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="e.g., 123456789012"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Format</label>
        <select
          value={data.format || 'CODE128'}
          onChange={(e) => handleChange('format', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="CODE128">CODE128</option>
          <option value="EAN13">EAN13</option>
          <option value="UPC">UPC</option>
          <option value="CODE39">CODE39</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Width (0.5-10)</label>
        <input
          type="number"
          value={data.width || 2}
          onChange={(e) => handleChange('width', parseFloat(e.target.value))}
          className="w-full border border-gray-300 rounded px-3 py-2"
          min="0.5"
          max="10"
          step="0.1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Height (20-200)</label>
        <input
          type="number"
          value={data.height || 50}
          onChange={(e) => handleChange('height', parseInt(e.target.value))}
          className="w-full border border-gray-300 rounded px-3 py-2"
          min="20"
          max="200"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Show Text Below</label>
        <select
          value={data.displayValue ? 'true' : 'false'}
          onChange={(e) => handleChange('displayValue', e.target.value === 'true')}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>
    </div>
  );

  switch (sectionType) {
    case 'header':
      return renderHeaderFields();
    case 'custom_message':
      return renderCustomMessageFields();
    case 'items_list':
      return renderItemsListFields();
    case 'payment':
      return renderPaymentFields();
    case 'date_time':
      return renderDateTimeFields();
    case 'barcode':
      return renderBarcodeFields();
    default:
      return (
        <div className="text-gray-500">
          Unknown section type. Please select a valid section type.
        </div>
      );
  }
};

export default SectionDefaultsEditor;
