import React, { useState } from 'react';
import Image from 'next/image';
import { Section, DividerStyle, Alignment } from '../lib/types';
import { FiChevronDown, FiChevronUp, FiMove, FiTrash2, FiCopy, FiAlignLeft, FiAlignCenter, FiAlignRight, FiFile, FiMessageCircle, FiShoppingCart, FiCreditCard, FiClock, FiBarChart2 } from 'react-icons/fi';
import ToggleSwitch from './ToggleSwitch';

interface SectionEditorProps {
  section: Section;
  onUpdate: (section: Section) => void;
  onRemove?: () => void;
  onDuplicate?: () => void;
  dragHandleProps?: any;
}

const SectionEditor: React.FC<SectionEditorProps> = ({ section, onUpdate, onRemove, onDuplicate, dragHandleProps }) => {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const getSectionIcon = () => {
    switch (section.type) {
      case 'header': return <FiFile className="w-4 h-4" />;
      case 'custom_message': return <FiMessageCircle className="w-4 h-4" />;
      case 'items_list': return <FiShoppingCart className="w-4 h-4" />;
      case 'payment': return <FiCreditCard className="w-4 h-4" />;
      case 'date_time': return <FiClock className="w-4 h-4" />;
      case 'barcode': return <FiBarChart2 className="w-4 h-4" />;
      default: return <FiFile className="w-4 h-4" />;
    }
  };

  const renderAlignmentButtons = (currentAlignment: Alignment, onChange: (alignment: Alignment) => void) => {
    return (
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Alignment</label>
        <div className="flex gap-0 border border-gray-300 rounded overflow-hidden w-fit">
          <button
            type="button"
            onClick={() => onChange('left')}
            className={`px-4 py-2 border-r border-gray-300 transition-colors cursor-pointer ${
              currentAlignment === 'left' 
                ? 'bg-gray-100 text-gray-900' 
                : 'bg-white text-gray-900 hover:bg-gray-50'
            }`}
          >
            <FiAlignLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => onChange('center')}
            className={`px-4 py-2 border-r border-gray-300 transition-colors cursor-pointer ${
              currentAlignment === 'center' 
                ? 'bg-gray-100 text-gray-900' 
                : 'bg-white text-gray-900 hover:bg-gray-50'
            }`}
          >
            <FiAlignCenter size={18} />
          </button>
          <button
            type="button"
            onClick={() => onChange('right')}
            className={`px-4 py-2 transition-colors cursor-pointer ${
              currentAlignment === 'right' 
                ? 'bg-gray-100 text-gray-900' 
                : 'bg-white text-gray-900 hover:bg-gray-50'
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
        return <span className="text-lg font-bold text-navy-900">- - -</span>;
      case 'solid':
        return <span className="text-lg font-bold text-navy-900">===</span>;
      case 'dotted':
        return <span className="text-lg font-bold text-navy-900">...</span>;
      case 'double':
        return <span className="text-lg font-bold text-navy-900">⋮⋮⋮</span>;
      case 'stars':
        return <span className="text-lg font-bold text-navy-900">***</span>;
      case 'blank':
        return <span className="text-lg font-bold text-navy-300">[ ]</span>;
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
                    <Image 
                      src={section.logo} 
                      alt="Logo preview" 
                      width={section.logoSize || 64}
                      height={section.logoSize || 64}
                      className="object-contain border border-gray-300 rounded-lg"
                      unoptimized
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
                      className="mt-2 text-xs text-red-600 hover:text-red-800 transition-colors cursor-pointer"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 placeholder:text-gray-400"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 placeholder:text-gray-400"
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
              <div className="grid grid-cols-[80px_1fr_100px_auto] gap-2 mb-2 text-xs text-navy-600 font-medium">
                <div>Quantity</div>
                <div>Item</div>
                <div>Total Price</div>
                <div></div>
              </div>
              {section.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-[80px_1fr_100px_auto] gap-2 mb-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => {
                      const newItems = [...section.items];
                      newItems[idx].quantity = parseFloat(e.target.value) || 0;
                      onUpdate({ ...section, items: newItems });
                    }}
                    placeholder="Qty"
                    className="border border-gray-300 rounded-lg px-2 py-1 text-sm placeholder:text-gray-400"
                  />
                  <input
                    type="text"
                    value={item.item}
                    onChange={(e) => {
                      const newItems = [...section.items];
                      newItems[idx].item = e.target.value;
                      onUpdate({ ...section, items: newItems });
                    }}
                    placeholder="Item name"
                    className="border border-gray-300 rounded-lg px-2 py-1 text-sm placeholder:text-gray-400"
                  />
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => {
                      const newItems = [...section.items];
                      newItems[idx].price = parseFloat(e.target.value) || 0;
                      onUpdate({ ...section, items: newItems });
                    }}
                    placeholder="$0.00"
                    className="border border-gray-300 rounded-lg px-2 py-1 text-sm placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newItems = section.items.filter((_, i) => i !== idx);
                      onUpdate({ ...section, items: newItems });
                    }}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 rounded-lg transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newItems = [...section.items, { quantity: 1, item: '', price: 0 }];
                  onUpdate({ ...section, items: newItems });
                }}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg px-3 py-2 text-sm text-accent-500 hover:border-accent-600 hover:bg-accent-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="text-lg">⊕</span> Add line
              </button>
            </div>
            
            {/* Divider after Items controls */}
            <div className="mb-3 pb-3 border-b border-gray-300">
              <ToggleSwitch
                checked={section.dividerAfterItems ?? false}
                onChange={(checked) => onUpdate({ ...section, dividerAfterItems: checked })}
                label="Divider after Items"
              />
              {section.dividerAfterItems && (
                <div className="flex flex-nowrap gap-0 border border-gray-300 rounded-lg overflow-hidden w-fit mt-2">
                  <button
                    type="button"
                    onClick={() => onUpdate({ ...section, dividerAfterItemsStyle: 'dashed' })}
                    className={`px-3 py-2 border-r border-gray-300 transition-colors cursor-pointer ${
                      (section.dividerAfterItemsStyle ?? section.dividerStyle) === 'dashed'
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-white text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {renderDividerIcon('dashed')}
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdate({ ...section, dividerAfterItemsStyle: 'solid' })}
                    className={`px-3 py-2 border-r border-gray-300 transition-colors cursor-pointer ${
                      (section.dividerAfterItemsStyle ?? section.dividerStyle) === 'solid'
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-white text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {renderDividerIcon('solid')}
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdate({ ...section, dividerAfterItemsStyle: 'dotted' })}
                    className={`px-3 py-2 border-r border-gray-300 transition-colors cursor-pointer ${
                      (section.dividerAfterItemsStyle ?? section.dividerStyle) === 'dotted'
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-white text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {renderDividerIcon('dotted')}
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdate({ ...section, dividerAfterItemsStyle: 'double' })}
                    className={`px-3 py-2 border-r border-gray-300 transition-colors cursor-pointer ${
                      (section.dividerAfterItemsStyle ?? section.dividerStyle) === 'double'
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-white text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {renderDividerIcon('double')}
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdate({ ...section, dividerAfterItemsStyle: 'stars' })}
                    className={`px-3 py-2 border-r border-gray-300 transition-colors cursor-pointer ${
                      (section.dividerAfterItemsStyle ?? section.dividerStyle) === 'stars'
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-white text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {renderDividerIcon('stars')}
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdate({ ...section, dividerAfterItemsStyle: 'blank' })}
                    className={`px-3 py-2 transition-colors cursor-pointer ${
                      (section.dividerAfterItemsStyle ?? section.dividerStyle) === 'blank'
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-white text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {renderDividerIcon('blank')}
                  </button>
                </div>
              )}
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium mb-2">Total Lines</label>
              <div className="grid grid-cols-[1fr_120px_auto] gap-2 mb-2 text-xs text-navy-600 font-medium">
                <div>Title</div>
                <div>Value</div>
                <div></div>
              </div>
              {section.totalLines.map((line, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_120px_auto] gap-2 mb-2">
                  <input
                    type="text"
                    value={line.title}
                    onChange={(e) => {
                      const newLines = [...section.totalLines];
                      newLines[idx].title = e.target.value;
                      onUpdate({ ...section, totalLines: newLines });
                    }}
                    placeholder="e.g., Subtotal"
                    className="border border-gray-300 rounded-lg px-2 py-1 text-sm placeholder:text-gray-400"
                  />
                  <input
                    type="number"
                    value={line.value}
                    onChange={(e) => {
                      const newLines = [...section.totalLines];
                      newLines[idx].value = parseFloat(e.target.value) || 0;
                      onUpdate({ ...section, totalLines: newLines });
                    }}
                    placeholder="$0.00"
                    className="border border-gray-300 rounded-lg px-2 py-1 text-sm placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newLines = section.totalLines.filter((_, i) => i !== idx);
                      onUpdate({ ...section, totalLines: newLines });
                    }}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 rounded-lg transition-colors"
                    title="Remove line"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newLines = [...section.totalLines, { title: '', value: 0 }];
                  onUpdate({ ...section, totalLines: newLines });
                }}
                className="w-full border-2 border-dashed border-gray-300 rounded px-3 py-2 text-sm text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 mb-3 cursor-pointer"
              >
                <span className="text-lg">⊕</span> Add line
              </button>
              
              <div className="grid grid-cols-[1fr_120px] gap-2 p-2 bg-navy-50 rounded-lg">
                <input
                  type="text"
                  value={section.total.title}
                  onChange={(e) => onUpdate({ 
                    ...section, 
                    total: { ...section.total, title: e.target.value }
                  })}
                  placeholder="Total:"
                  className="border border-gray-300 rounded-lg px-2 py-1 text-sm font-medium placeholder:text-gray-400"
                />
                <input
                  type="number"
                  value={section.total.price}
                  onChange={(e) => onUpdate({ 
                    ...section, 
                    total: { ...section.total, price: parseFloat(e.target.value) || 0 }
                  })}
                  placeholder="$0.00"
                  className="border border-gray-300 rounded-lg px-2 py-1 text-sm font-medium placeholder:text-gray-400"
                />
              </div>
            </div>
            
            {/* Total Size Increase controls */}
            <div className="mb-3 pb-3 border-b border-gray-300">
              <ToggleSwitch
                checked={section.increaseTotalSize ?? false}
                onChange={(checked) => onUpdate({ ...section, increaseTotalSize: checked, totalSizeIncrease: checked ? 20 : 0 })}
                label='Increase "Total" number size'
              />
              {section.increaseTotalSize && (
                <div className="flex gap-0 border border-gray-300 rounded-lg overflow-hidden w-fit mt-2">
                  <button
                    type="button"
                    onClick={() => onUpdate({ ...section, totalSizeIncrease: 10 })}
                    className={`px-4 py-2 border-r border-gray-300 transition-colors cursor-pointer ${
                      section.totalSizeIncrease === 10
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-white text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    +10%
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdate({ ...section, totalSizeIncrease: 20 })}
                    className={`px-4 py-2 border-r border-gray-300 transition-colors cursor-pointer ${
                      section.totalSizeIncrease === 20
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-white text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    +20%
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdate({ ...section, totalSizeIncrease: 50 })}
                    className={`px-4 py-2 border-r border-gray-300 transition-colors cursor-pointer ${
                      section.totalSizeIncrease === 50
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-white text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    +50%
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdate({ ...section, totalSizeIncrease: 75 })}
                    className={`px-4 py-2 border-r border-gray-300 transition-colors cursor-pointer ${
                      section.totalSizeIncrease === 75
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-white text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    +75%
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdate({ ...section, totalSizeIncrease: 100 })}
                    className={`px-4 py-2 transition-colors cursor-pointer ${
                      section.totalSizeIncrease === 100
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-white text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    +100%
                  </button>
                </div>
              )}
            </div>
            
            {/* Divider after Total controls */}
            <div className="mb-3">
              <ToggleSwitch
                checked={section.dividerAfterTotal ?? section.dividerAtBottom ?? false}
                onChange={(checked) => onUpdate({ ...section, dividerAfterTotal: checked })}
                label="Divider after Total"
              />
              {(section.dividerAfterTotal ?? section.dividerAtBottom) && (
                <div className="flex flex-nowrap gap-0 border border-gray-300 rounded-lg overflow-hidden w-fit mt-2">
                  <button
                    type="button"
                    onClick={() => onUpdate({ ...section, dividerAfterTotalStyle: 'dashed' })}
                    className={`px-3 py-2 border-r border-gray-300 transition-colors cursor-pointer ${
                      (section.dividerAfterTotalStyle ?? section.dividerStyle) === 'dashed'
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-white text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {renderDividerIcon('dashed')}
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdate({ ...section, dividerAfterTotalStyle: 'solid' })}
                    className={`px-3 py-2 border-r border-gray-300 transition-colors cursor-pointer ${
                      (section.dividerAfterTotalStyle ?? section.dividerStyle) === 'solid'
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-white text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {renderDividerIcon('solid')}
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdate({ ...section, dividerAfterTotalStyle: 'dotted' })}
                    className={`px-3 py-2 border-r border-gray-300 transition-colors cursor-pointer ${
                      (section.dividerAfterTotalStyle ?? section.dividerStyle) === 'dotted'
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-white text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {renderDividerIcon('dotted')}
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdate({ ...section, dividerAfterTotalStyle: 'double' })}
                    className={`px-3 py-2 border-r border-gray-300 transition-colors cursor-pointer ${
                      (section.dividerAfterTotalStyle ?? section.dividerStyle) === 'double'
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-white text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {renderDividerIcon('double')}
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdate({ ...section, dividerAfterTotalStyle: 'stars' })}
                    className={`px-3 py-2 border-r border-gray-300 transition-colors cursor-pointer ${
                      (section.dividerAfterTotalStyle ?? section.dividerStyle) === 'stars'
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-white text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {renderDividerIcon('stars')}
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdate({ ...section, dividerAfterTotalStyle: 'blank' })}
                    className={`px-3 py-2 transition-colors cursor-pointer ${
                      (section.dividerAfterTotalStyle ?? section.dividerStyle) === 'blank'
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-white text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {renderDividerIcon('blank')}
                  </button>
                </div>
              )}
            </div>
          </>
        );

      case 'payment':
        const currentFields = section.paymentType === 'cash' 
          ? (section.cashFields || [])
          : (section.cardFields || []);
        const fieldKey = section.paymentType === 'cash' ? 'cashFields' : 'cardFields';
        
        return (
          <>
            <div className="mb-3">
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => onUpdate({ ...section, paymentType: 'cash' as const })}
                  className={`flex-1 px-4 py-2 font-medium transition-colors ${
                    section.paymentType === 'cash'
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-white text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Cash
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ ...section, paymentType: 'card' as const })}
                  className={`flex-1 px-4 py-2 font-medium transition-colors ${
                    section.paymentType === 'card'
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-white text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Card
                </button>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2 text-xs text-navy-600 font-medium">
                <div>Title</div>
                <div>Value</div>
                <div></div>
              </div>
              {currentFields.map((field, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2">
                  <input
                    type="text"
                    value={field.title}
                    onChange={(e) => {
                      const newFields = [...currentFields];
                      newFields[idx].title = e.target.value;
                      onUpdate({ ...section, [fieldKey]: newFields });
                    }}
                    placeholder="e.g., Card number"
                    className="border border-gray-300 rounded-lg px-2 py-1 text-sm placeholder:text-gray-400"
                  />
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => {
                      const newFields = [...currentFields];
                      newFields[idx].value = e.target.value;
                      onUpdate({ ...section, [fieldKey]: newFields });
                    }}
                    placeholder="Enter value"
                    className="border border-gray-300 rounded-lg px-2 py-1 text-sm placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newFields = currentFields.filter((_, i) => i !== idx);
                      onUpdate({ ...section, [fieldKey]: newFields });
                    }}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 rounded-lg transition-colors"
                    title="Remove field"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newFields = [...currentFields, { title: '', value: '' }];
                  onUpdate({ ...section, [fieldKey]: newFields });
                }}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg px-3 py-2 text-sm text-accent-500 hover:border-accent-600 hover:bg-accent-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="text-lg">⊕</span> Add line
              </button>
            </div>
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 placeholder:text-gray-400"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 placeholder:text-gray-400"
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
    <div className="border border-gray-300 rounded-xl bg-white overflow-hidden">
      <div className={`flex items-center justify-between p-3 bg-navy-50 ${isExpanded ? 'rounded-t-xl' : 'rounded-xl'}`}>
        <div className="flex items-center space-x-2">
          <button {...dragHandleProps} className="cursor-move text-navy-400 hover:text-navy-600 transition-colors">
            <FiMove />
          </button>
          <div className="flex items-center space-x-2">
            {getSectionIcon()}
            <span className="font-semibold">{getSectionTitle()}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {onDuplicate && (
            <button
              onClick={onDuplicate}
              className="text-accent-500 hover:text-accent-600 hover:bg-accent-50 p-1 rounded-lg transition-colors cursor-pointer"
              title="Duplicate section"
            >
              <FiCopy />
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded-lg transition-colors cursor-pointer"
              title="Remove section"
            >
              <FiTrash2 />
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-navy-600 hover:text-navy-800 transition-colors cursor-pointer"
          >
            {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4">
          {renderFields()}
          
          {section.type !== 'items_list' && (
            <div className="mt-4 pt-4 border-t border-gray-300">
              <div className="mb-3">
                <ToggleSwitch
                  checked={section.dividerAtBottom}
                  onChange={(checked) => onUpdate({ ...section, dividerAtBottom: checked })}
                  label="Divider at the bottom"
                />
              </div>
              {section.dividerAtBottom && (
              <div className="flex flex-nowrap gap-0 border border-gray-300 rounded-lg overflow-hidden w-fit">
                <button
                  type="button"
                  onClick={() => onUpdate({ ...section, dividerStyle: 'dashed' })}
                  className={`px-3 py-2 border-r border-gray-300 transition-colors cursor-pointer ${
                    section.dividerStyle === 'dashed'
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-white text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {renderDividerIcon('dashed')}
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ ...section, dividerStyle: 'solid' })}
                  className={`px-3 py-2 border-r border-gray-300 transition-colors cursor-pointer ${
                    section.dividerStyle === 'solid'
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-white text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {renderDividerIcon('solid')}
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ ...section, dividerStyle: 'dotted' })}
                  className={`px-3 py-2 border-r border-gray-300 transition-colors cursor-pointer ${
                    section.dividerStyle === 'dotted'
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-white text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {renderDividerIcon('dotted')}
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ ...section, dividerStyle: 'double' })}
                  className={`px-3 py-2 border-r border-gray-300 transition-colors cursor-pointer ${
                    section.dividerStyle === 'double'
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-white text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {renderDividerIcon('double')}
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ ...section, dividerStyle: 'stars' })}
                  className={`px-3 py-2 border-r border-gray-300 transition-colors cursor-pointer ${
                    section.dividerStyle === 'stars'
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-white text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {renderDividerIcon('stars')}
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ ...section, dividerStyle: 'blank' })}
                  className={`px-3 py-2 transition-colors cursor-pointer ${
                    section.dividerStyle === 'blank'
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-white text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {renderDividerIcon('blank')}
                </button>
              </div>
            )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SectionEditor;
