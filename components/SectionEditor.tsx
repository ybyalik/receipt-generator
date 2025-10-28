import React, { useState } from 'react';
import { Section, DividerStyle, Alignment } from '../lib/types';
import { FiChevronDown, FiChevronUp, FiMove, FiTrash2, FiCopy, FiAlignLeft, FiAlignCenter, FiAlignRight } from 'react-icons/fi';

interface SectionEditorProps {
  section: Section;
  onUpdate: (section: Section) => void;
  onRemove?: () => void;
  onDuplicate?: () => void;
  dragHandleProps?: any;
}

const SectionEditor: React.FC<SectionEditorProps> = ({ section, onUpdate, onRemove, onDuplicate, dragHandleProps }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getSectionTitle = () => {
    switch (section.type) {
      case 'header': return 'Header';
      case 'custom_message': return 'Custom Message';
      case 'items_list': return 'Items List';
      case 'payment': return 'Payment';
      case 'date_time': return 'Date & Time';
      case 'barcode': return 'Barcode';
      default: return 'Section';
    }
  };

  const renderAlignmentButtons = (currentAlignment: Alignment, onChange: (alignment: Alignment) => void) => {
    return (
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Alignment</label>
        <div className="flex gap-0 border rounded overflow-hidden w-fit">
          <button
            type="button"
            onClick={() => onChange('left')}
            className={`px-4 py-2 border-r transition-colors ${
              currentAlignment === 'left' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FiAlignLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => onChange('center')}
            className={`px-4 py-2 border-r transition-colors ${
              currentAlignment === 'center' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FiAlignCenter size={18} />
          </button>
          <button
            type="button"
            onClick={() => onChange('right')}
            className={`px-4 py-2 transition-colors ${
              currentAlignment === 'right' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FiAlignRight size={18} />
          </button>
        </div>
      </div>
    );
  };

  const renderDividerIcon = (style: DividerStyle) => {
    switch (style) {
      case 'dashed':
        return <span className="text-lg font-bold">- - -</span>;
      case 'solid':
        return <span className="text-lg font-bold">===</span>;
      case 'dotted':
        return <span className="text-lg font-bold">...</span>;
      case 'double':
        return <span className="text-lg font-bold">⋮⋮⋮</span>;
      case 'stars':
        return <span className="text-lg font-bold">***</span>;
      case 'blank':
        return <span className="text-lg font-bold">&nbsp;&nbsp;&nbsp;</span>;
    }
  };

  const renderFields = () => {
    switch (section.type) {
      case 'header':
        return (
          <>
            {renderAlignmentButtons(section.alignment, (alignment) => onUpdate({ ...section, alignment }))}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Logo</label>
              <div className="flex items-center gap-3">
                {section.logo && (
                  <div className="relative">
                    <img 
                      src={section.logo} 
                      alt="Logo preview" 
                      style={{ width: section.logoSize, height: section.logoSize }}
                      className="object-contain border rounded"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          onUpdate({ ...section, logo: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-sm"
                  />
                  {section.logo && (
                    <button
                      type="button"
                      onClick={() => onUpdate({ ...section, logo: undefined })}
                      className="mt-2 text-xs text-red-600 hover:text-red-800"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Business Details</label>
              <textarea
                value={section.businessDetails}
                onChange={(e) => onUpdate({ ...section, businessDetails: e.target.value })}
                className="w-full border rounded px-3 py-2 h-24 placeholder:text-gray-400"
                placeholder="Business Name\nAddress\nPhone"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Logo Size: {section.logoSize}px</label>
              <input
                type="range"
                min="30"
                max="100"
                value={section.logoSize}
                onChange={(e) => onUpdate({ ...section, logoSize: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </>
        );

      case 'custom_message':
        return (
          <>
            {renderAlignmentButtons(section.alignment, (alignment) => onUpdate({ ...section, alignment }))}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                value={section.message}
                onChange={(e) => onUpdate({ ...section, message: e.target.value })}
                className="w-full border rounded px-3 py-2 h-24 placeholder:text-gray-400"
                placeholder="Enter your custom message"
              />
            </div>
          </>
        );

      case 'items_list':
        return (
          <>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-2">Items</label>
              {section.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2 mb-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => {
                      const newItems = [...section.items];
                      newItems[idx].quantity = parseFloat(e.target.value);
                      onUpdate({ ...section, items: newItems });
                    }}
                    placeholder="Qty"
                    className="border rounded px-2 py-1 text-sm placeholder:text-gray-400"
                  />
                  <input
                    type="text"
                    value={item.item}
                    onChange={(e) => {
                      const newItems = [...section.items];
                      newItems[idx].item = e.target.value;
                      onUpdate({ ...section, items: newItems });
                    }}
                    placeholder="Item"
                    className="border rounded px-2 py-1 text-sm placeholder:text-gray-400"
                  />
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => {
                      const newItems = [...section.items];
                      newItems[idx].price = parseFloat(e.target.value);
                      onUpdate({ ...section, items: newItems });
                    }}
                    placeholder="Price"
                    className="border rounded px-2 py-1 text-sm placeholder:text-gray-400"
                  />
                </div>
              ))}
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Total</label>
              <input
                type="number"
                value={section.total.price}
                onChange={(e) => onUpdate({ 
                  ...section, 
                  total: { ...section.total, price: parseFloat(e.target.value) }
                })}
                className="w-full border rounded px-3 py-2 placeholder:text-gray-400"
              />
            </div>
          </>
        );

      case 'payment':
        return (
          <>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Payment Type</label>
              <select
                value={section.paymentType}
                onChange={(e) => onUpdate({ ...section, paymentType: e.target.value as 'cash' | 'card' })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
              </select>
            </div>
            {section.paymentType === 'card' && section.card && (
              <>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Card Number</label>
                  <input
                    type="text"
                    value={section.card.cardNumber}
                    onChange={(e) => onUpdate({
                      ...section,
                      card: { ...section.card!, cardNumber: e.target.value }
                    })}
                    className="w-full border rounded px-3 py-2 placeholder:text-gray-400"
                    placeholder="**** **** **** 1234"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Card Type</label>
                  <input
                    type="text"
                    value={section.card.cardType}
                    onChange={(e) => onUpdate({
                      ...section,
                      card: { ...section.card!, cardType: e.target.value }
                    })}
                    className="w-full border rounded px-3 py-2 placeholder:text-gray-400"
                    placeholder="Visa, Mastercard, etc."
                  />
                </div>
              </>
            )}
          </>
        );

      case 'date_time':
        return (
          <>
            {renderAlignmentButtons(section.alignment, (alignment) => onUpdate({ ...section, alignment }))}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Date & Time</label>
              <input
                type="text"
                value={section.date}
                onChange={(e) => onUpdate({ ...section, date: e.target.value })}
                className="w-full border rounded px-3 py-2 placeholder:text-gray-400"
                placeholder="MM/DD/YYYY HH:MM AM"
              />
            </div>
          </>
        );

      case 'barcode':
        return (
          <>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Barcode Value</label>
              <input
                type="text"
                value={section.value}
                onChange={(e) => onUpdate({ ...section, value: e.target.value })}
                className="w-full border rounded px-3 py-2 placeholder:text-gray-400"
                placeholder="1234567890123"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Size: {section.size}</label>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={section.size}
                onChange={(e) => onUpdate({ ...section, size: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="border rounded-lg bg-white">
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <button {...dragHandleProps} className="cursor-move text-gray-400 hover:text-gray-600">
            <FiMove />
          </button>
          <span className="font-semibold">{getSectionTitle()}</span>
        </div>
        <div className="flex items-center space-x-2">
          {onDuplicate && (
            <button
              onClick={onDuplicate}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 rounded transition-colors"
              title="Duplicate section"
            >
              <FiCopy />
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors"
              title="Remove section"
            >
              <FiTrash2 />
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 hover:text-gray-800"
          >
            {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4">
          {renderFields()}
          
          <div className="mt-4 pt-4 border-t">
            <label className="flex items-center text-sm mb-3">
              <input
                type="checkbox"
                checked={section.dividerAtBottom}
                onChange={(e) => onUpdate({ ...section, dividerAtBottom: e.target.checked })}
                className="mr-2"
              />
              Divider at the bottom
            </label>
            {section.dividerAtBottom && (
              <div className="flex gap-0 border rounded overflow-hidden w-fit">
                <button
                  type="button"
                  onClick={() => onUpdate({ ...section, dividerStyle: 'dashed' })}
                  className={`px-4 py-2 border-r transition-colors ${
                    section.dividerStyle === 'dashed'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {renderDividerIcon('dashed')}
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ ...section, dividerStyle: 'solid' })}
                  className={`px-4 py-2 border-r transition-colors ${
                    section.dividerStyle === 'solid'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {renderDividerIcon('solid')}
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ ...section, dividerStyle: 'dotted' })}
                  className={`px-4 py-2 border-r transition-colors ${
                    section.dividerStyle === 'dotted'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {renderDividerIcon('dotted')}
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ ...section, dividerStyle: 'double' })}
                  className={`px-4 py-2 border-r transition-colors ${
                    section.dividerStyle === 'double'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {renderDividerIcon('double')}
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ ...section, dividerStyle: 'stars' })}
                  className={`px-4 py-2 border-r transition-colors ${
                    section.dividerStyle === 'stars'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {renderDividerIcon('stars')}
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ ...section, dividerStyle: 'blank' })}
                  className={`px-4 py-2 transition-colors ${
                    section.dividerStyle === 'blank'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {renderDividerIcon('blank')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionEditor;
