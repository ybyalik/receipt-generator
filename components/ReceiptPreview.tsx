import React, { useRef } from 'react';
import { Section } from '../lib/types';
import JsBarcode from 'jsbarcode';
import { format } from 'date-fns';

interface ReceiptPreviewProps {
  sections: Section[];
  showWatermark?: boolean;
  previewRef?: React.RefObject<HTMLDivElement>;
}

const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ 
  sections, 
  showWatermark = true,
  previewRef 
}) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const ref = previewRef || internalRef;

  const renderDivider = (style: string, show: boolean) => {
    if (!show) return null;
    
    if (style === 'blank') {
      return <div className="my-3" />;
    }
    
    const textDividers = {
      dashed: '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -',
      solid: '=================================================',
      dotted: '. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .',
      double: '⋮ ⋮ ⋮ ⋮ ⋮ ⋮ ⋮ ⋮ ⋮ ⋮ ⋮ ⋮ ⋮ ⋮ ⋮ ⋮ ⋮ ⋮ ⋮ ⋮ ⋮ ⋮ ⋮ ⋮ ⋮',
      stars: '* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *',
    };

    return (
      <div className="my-2 text-center text-gray-400 text-xs overflow-hidden">
        {textDividers[style as keyof typeof textDividers] || ''}
      </div>
    );
  };

  const renderSection = (section: Section) => {
    switch (section.type) {
      case 'header':
        return (
          <div key={section.id} className="mb-4">
            <div className={`text-${section.alignment}`}>
              <div className="mb-2">
                {section.logo ? (
                  <img 
                    src={section.logo} 
                    alt="Business logo" 
                    style={{ 
                      width: section.logoSize, 
                      height: section.logoSize 
                    }}
                    className="inline-block object-contain"
                  />
                ) : (
                  <div 
                    className="inline-block bg-gray-200 rounded flex items-center justify-center"
                    style={{ 
                      width: section.logoSize, 
                      height: section.logoSize 
                    }}
                  >
                    <span className="text-gray-400 text-xs">LOGO</span>
                  </div>
                )}
              </div>
              <div className="whitespace-pre-line text-sm font-medium">
                {section.businessDetails}
              </div>
            </div>
            {renderDivider(section.dividerStyle, section.dividerAtBottom)}
          </div>
        );

      case 'custom_message':
        return (
          <div key={section.id} className="mb-4">
            <div className={`text-${section.alignment} text-sm whitespace-pre-line`}>
              {section.message}
            </div>
            {renderDivider(section.dividerStyle, section.dividerAtBottom)}
          </div>
        );

      case 'items_list':
        return (
          <div key={section.id} className="mb-4">
            <div className="space-y-1 text-xs">
              {section.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>
                    {item.quantity} x {item.item}
                  </span>
                  <span>${item.price.toFixed(2)}</span>
                </div>
              ))}
              {/* Divider after items */}
              {renderDivider(
                section.dividerAfterItemsStyle ?? section.dividerStyle,
                section.dividerAfterItems ?? section.dividerAtBottom
              )}
              <div className={`${section.dividerAfterItems || section.dividerAtBottom ? 'mt-2 pt-2' : 'border-t border-gray-300 mt-2 pt-2'}`}>
                {section.totalLines.map((line, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{line.title}:</span>
                    <span>${line.value.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold mt-2">
                  <span>{section.total.title}:</span>
                  <span>${section.total.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
            {/* Divider after total */}
            {renderDivider(
              section.dividerAfterTotalStyle ?? section.dividerStyle,
              section.dividerAfterTotal ?? section.dividerAtBottom
            )}
          </div>
        );

      case 'payment':
        const paymentFields = section.paymentType === 'cash'
          ? (section.cashFields || [])
          : (section.cardFields || []);
        return (
          <div key={section.id} className="mb-4">
            <div className="text-xs space-y-1">
              {paymentFields.map((field, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{field.title}:</span>
                  <span className={idx === paymentFields.length - 1 ? 'font-bold' : ''}>
                    {field.value}
                  </span>
                </div>
              ))}
            </div>
            {renderDivider(section.dividerStyle, section.dividerAtBottom)}
          </div>
        );

      case 'date_time':
        return (
          <div key={section.id} className="mb-4">
            <div className={`text-${section.alignment} text-xs`}>
              {section.date}
            </div>
            {renderDivider(section.dividerStyle, section.dividerAtBottom)}
          </div>
        );

      case 'barcode':
        return (
          <div key={section.id} className="mb-4">
            <div className="flex justify-center">
              <svg
                ref={(svg) => {
                  if (svg) {
                    try {
                      JsBarcode(svg, section.value, {
                        format: 'CODE128',
                        width: section.size,
                        height: 50,
                        displayValue: false,
                      });
                    } catch (e) {
                      console.error('Barcode generation error:', e);
                    }
                  }
                }}
              />
            </div>
            {renderDivider(section.dividerStyle, section.dividerAtBottom)}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <div 
        ref={ref}
        className="bg-white p-8 shadow-lg max-w-md mx-auto relative"
        style={{ fontFamily: 'monospace' }}
      >
        {sections.map(renderSection)}
      </div>
      {showWatermark && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className="text-gray-300 font-bold transform rotate-[-45deg]"
            style={{ fontSize: '4rem', opacity: 0.3 }}
          >
            SAMPLE
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptPreview;
