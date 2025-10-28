import React, { useRef } from 'react';
import { Section, TemplateSettings } from '../lib/types';
import { formatCurrency, getFontFamily } from '../lib/currency';
import JsBarcode from 'jsbarcode';
import { format } from 'date-fns';

interface ReceiptPreviewProps {
  sections: Section[];
  settings: TemplateSettings;
  showWatermark?: boolean;
  previewRef?: React.RefObject<HTMLDivElement>;
}

const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ 
  sections,
  settings,
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
            <div className="text-xs">
              {/* Items list */}
              <div className="space-y-1">
                {section.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {item.quantity} x {item.item}
                    </span>
                    <span>{formatCurrency(item.price, settings.currency, settings.currencyFormat)}</span>
                  </div>
                ))}
              </div>
              
              {/* Divider after items */}
              {renderDivider(
                section.dividerAfterItemsStyle ?? section.dividerStyle,
                section.dividerAfterItems ?? false
              )}
              
              {/* Total lines section */}
              <div className={`space-y-1 ${(section.dividerAfterItems) ? 'mt-2' : 'border-t border-gray-300 mt-2 pt-2'}`}>
                {section.totalLines.map((line, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{line.title}:</span>
                    <span>{formatCurrency(line.value, settings.currency, settings.currencyFormat)}</span>
                  </div>
                ))}
                <div 
                  className="flex justify-between font-bold mt-2"
                  style={
                    section.increaseTotalSize && section.totalSizeIncrease
                      ? { fontSize: `${12 * (1 + section.totalSizeIncrease / 100)}px` }
                      : undefined
                  }
                >
                  <span>{section.total.title}:</span>
                  <span>{formatCurrency(section.total.price, settings.currency, settings.currencyFormat)}</span>
                </div>
              </div>
            </div>
            
            {/* Divider after total */}
            {renderDivider(
              section.dividerAfterTotalStyle ?? section.dividerStyle,
              section.dividerAfterTotal ?? section.dividerAtBottom ?? false
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

  const getBackgroundStyle = () => {
    if (settings.backgroundTexture === 'none') {
      return { backgroundColor: 'white' };
    }
    
    const textures = {
      texture1: 'repeating-linear-gradient(45deg, #f5f5f0 0px, #f5f5f0 10px, #e8e8e0 10px, #e8e8e0 20px)',
      texture2: 'radial-gradient(circle at 20% 50%, rgba(0,0,0,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(0,0,0,0.05) 0%, transparent 50%)',
      texture3: 'linear-gradient(135deg, #faf8f3 25%, transparent 25%), linear-gradient(225deg, #faf8f3 25%, transparent 25%), linear-gradient(45deg, #faf8f3 25%, transparent 25%), linear-gradient(315deg, #faf8f3 25%, #f5f2ed 25%)',
      texture4: 'repeating-radial-gradient(circle at 0 0, transparent 0, #f5f5f0 10px), repeating-linear-gradient(#e8e8e055, #e8e8e0)',
      texture5: 'linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px)',
    };
    
    return {
      backgroundColor: '#faf8f3',
      backgroundImage: textures[settings.backgroundTexture as keyof typeof textures] || textures.texture1,
      backgroundSize: settings.backgroundTexture === 'texture5' ? '20px 20px' : (settings.backgroundTexture === 'texture3' ? '40px 40px' : 'auto'),
    };
  };

  return (
    <div className="relative">
      <div 
        ref={ref}
        className="p-8 shadow-lg max-w-md mx-auto relative"
        style={{ 
          fontFamily: getFontFamily(settings.font),
          color: settings.textColor,
          ...getBackgroundStyle()
        }}
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
