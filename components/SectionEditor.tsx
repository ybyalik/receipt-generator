import React, { useState } from 'react';
import { Section, DividerStyle, Alignment } from '../lib/types';
import { FiChevronDown, FiChevronUp, FiMove, FiTrash2 } from 'react-icons/fi';

interface SectionEditorProps {
  section: Section;
  onUpdate: (section: Section) => void;
  dragHandleProps?: any;
}

const SectionEditor: React.FC<SectionEditorProps> = ({ section, onUpdate, dragHandleProps }) => {
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

  const renderFields = () => {
    switch (section.type) {
      case 'header':
        return (
          <>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Alignment</label>
              <select
                value={section.alignment}
                onChange={(e) => onUpdate({ ...section, alignment: e.target.value as Alignment })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Business Details</label>
              <textarea
                value={section.businessDetails}
                onChange={(e) => onUpdate({ ...section, businessDetails: e.target.value })}
                className="w-full border rounded px-3 py-2 h-24"
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
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Alignment</label>
              <select
                value={section.alignment}
                onChange={(e) => onUpdate({ ...section, alignment: e.target.value as Alignment })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                value={section.message}
                onChange={(e) => onUpdate({ ...section, message: e.target.value })}
                className="w-full border rounded px-3 py-2 h-24"
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
                    className="border rounded px-2 py-1 text-sm"
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
                    className="border rounded px-2 py-1 text-sm"
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
                    className="border rounded px-2 py-1 text-sm"
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
                className="w-full border rounded px-3 py-2"
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
                    className="w-full border rounded px-3 py-2"
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
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </>
            )}
          </>
        );

      case 'date_time':
        return (
          <>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Alignment</label>
              <select
                value={section.alignment}
                onChange={(e) => onUpdate({ ...section, alignment: e.target.value as Alignment })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Date & Time</label>
              <input
                type="text"
                value={section.date}
                onChange={(e) => onUpdate({ ...section, date: e.target.value })}
                className="w-full border rounded px-3 py-2"
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
                className="w-full border rounded px-3 py-2"
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
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-600 hover:text-gray-800"
        >
          {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
        </button>
      </div>
      
      {isExpanded && (
        <div className="p-4">
          {renderFields()}
          
          <div className="mt-4 pt-4 border-t">
            <label className="flex items-center text-sm mb-2">
              <input
                type="checkbox"
                checked={section.dividerAtBottom}
                onChange={(e) => onUpdate({ ...section, dividerAtBottom: e.target.checked })}
                className="mr-2"
              />
              Show divider at bottom
            </label>
            {section.dividerAtBottom && (
              <select
                value={section.dividerStyle}
                onChange={(e) => onUpdate({ ...section, dividerStyle: e.target.value as DividerStyle })}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
                <option value="double">Double</option>
              </select>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionEditor;
