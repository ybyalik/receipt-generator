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
    
    // Realistic receipt textures - subtle wear, creases, and fold marks
    const textures = {
      // Slight crease down the middle (vertical fold)
      texture1: 'linear-gradient(to right, transparent 49%, rgba(0,0,0,0.02) 49.5%, rgba(0,0,0,0.04) 50%, rgba(0,0,0,0.02) 50.5%, transparent 51%)',
      // Horizontal fold marks (receipt folded in thirds)
      texture2: 'linear-gradient(to bottom, transparent 32%, rgba(0,0,0,0.015) 33%, rgba(0,0,0,0.03) 33.5%, rgba(0,0,0,0.015) 34%, transparent 34.5%, transparent 65%, rgba(0,0,0,0.015) 66%, rgba(0,0,0,0.03) 66.5%, rgba(0,0,0,0.015) 67%, transparent 67.5%)',
      // Slightly worn/aged with subtle staining
      texture3: 'radial-gradient(ellipse at 20% 30%, rgba(0,0,0,0.01) 0%, transparent 40%), radial-gradient(ellipse at 80% 70%, rgba(0,0,0,0.015) 0%, transparent 35%), radial-gradient(ellipse at 50% 90%, rgba(0,0,0,0.01) 0%, transparent 30%)',
      // Crumpled texture (multiple creases)
      texture4: 'linear-gradient(45deg, transparent 48%, rgba(0,0,0,0.015) 49%, rgba(0,0,0,0.02) 50%, rgba(0,0,0,0.015) 51%, transparent 52%), linear-gradient(-45deg, transparent 48%, rgba(0,0,0,0.01) 49.5%, rgba(0,0,0,0.015) 50%, rgba(0,0,0,0.01) 50.5%, transparent 52%)',
      // Edge wear and center fold combined
      texture5: 'linear-gradient(to right, rgba(0,0,0,0.02) 0%, transparent 5%, transparent 48%, rgba(0,0,0,0.025) 50%, transparent 52%, transparent 95%, rgba(0,0,0,0.02) 100%), linear-gradient(to bottom, rgba(0,0,0,0.015) 0%, transparent 3%, transparent 97%, rgba(0,0,0,0.015) 100%)',
    };
    
    return {
      backgroundColor: 'white',
      backgroundImage: textures[settings.backgroundTexture as keyof typeof textures] || textures.texture1,
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
