import React, { useRef } from 'react';
import Image from 'next/image';
import { Section, TemplateSettings } from '../lib/types';
import { formatCurrency, getFontFamily, getFontSize } from '../lib/currency';
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
    
    // Special handling for double (two rows of dots)
    if (style === 'double') {
      return (
        <div className="my-2 text-center overflow-hidden" style={{ lineHeight: '0.5' }}>
          <div className="whitespace-nowrap">••••••••••••••••••••••••••••••</div>
          <div className="whitespace-nowrap">••••••••••••••••••••••••••••••</div>
        </div>
      );
    }
    
    // Use text for other divider styles
    const textDividers = {
      dashed: '-------------------------------------------',
      solid: '===========================================',
      dotted: '• • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •',
      stars: '*******************************************',
    };

    return (
      <div className="my-2 text-center overflow-hidden whitespace-nowrap">
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
                  <Image 
                    src={section.logo} 
                    alt="Business logo" 
                    width={section.logoSize || 64}
                    height={section.logoSize || 64}
                    className="inline-block object-contain"
                    unoptimized
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
                  <div key={idx} className="flex justify-between gap-2">
                    <span className="flex-1 min-w-0 break-words">
                      {item.quantity} x {item.item}
                    </span>
                    <span className="flex-shrink-0 whitespace-nowrap">{formatCurrency(item.price, settings.currency, settings.currencyFormat)}</span>
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
                    <span>{line.title}</span>
                    <span>{formatCurrency(line.value, settings.currency, settings.currencyFormat)}</span>
                  </div>
                ))}
                <div className="flex justify-between mt-2">
                  <span>{section.total.title}</span>
                  <span
                    style={
                      section.increaseTotalSize && section.totalSizeIncrease
                        ? { fontSize: `${12 * (1 + section.totalSizeIncrease / 100)}px` }
                        : undefined
                    }
                  >
                    {formatCurrency(section.total.price, settings.currency, settings.currencyFormat)}
                  </span>
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
        
        // Helper to format payment field values
        const formatPaymentValue = (title: string, value: string) => {
          // Only format as currency if it's actually a currency field
          const currencyFields = ['Cash Tendered', 'Change', 'Amount', 'Total', 'Subtotal'];
          const isCurrencyField = currencyFields.some(cf => title.toLowerCase().includes(cf.toLowerCase()));
          
          if (isCurrencyField) {
            // Remove dollar signs and parse
            const cleanValue = value.replace(/[$,]/g, '');
            const numValue = parseFloat(cleanValue);
            if (!isNaN(numValue)) {
              return formatCurrency(numValue, settings.currency, settings.currencyFormat);
            }
          }
          
          // For non-currency fields, return as-is
          return value;
        };
        
        return (
          <div key={section.id} className="mb-4">
            <div className="text-xs space-y-1">
              {paymentFields.map((field, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{field.title}:</span>
                  <span>
                    {formatPaymentValue(field.title, field.value)}
                  </span>
                </div>
              ))}
            </div>
            {renderDivider(section.dividerStyle, section.dividerAtBottom)}
          </div>
        );

      case 'date_time':
        const formatDate = (dateString: string, formatString?: string) => {
          if (!dateString) return '';
          try {
            const date = new Date(dateString);
            const formatToUse = formatString || 'MM/dd/yyyy, h:mm:ss a';
            return format(date, formatToUse);
          } catch (error) {
            return dateString; // Fallback to original string if parsing fails
          }
        };

        return (
          <div key={section.id} className="mb-4">
            <div className={`text-${section.alignment} text-xs`}>
              {formatDate(section.date, section.dateFormat)}
            </div>
            {renderDivider(section.dividerStyle, section.dividerAtBottom)}
          </div>
        );

      case 'barcode':
        const barcodeValue = section.value || '1234567890123';
        const barcodeWidth = section.size || 2;
        const barcodeHeight = section.length || 50;
        return (
          <div key={section.id} className="mb-4">
            <div className="relative -mx-4 px-2">
              <svg
                ref={(svg) => {
                  if (svg && barcodeValue) {
                    try {
                      JsBarcode(svg, barcodeValue, {
                        format: 'CODE128',
                        width: barcodeWidth,
                        height: barcodeHeight,
                        displayValue: false,
                        margin: 0,
                      });
                    } catch (e) {
                      console.error('Barcode generation error:', e);
                    }
                  }
                }}
                className="w-full"
                style={{ 
                  display: 'block',
                  height: `${barcodeHeight}px`
                }}
              />
            </div>
            {renderDivider(section.dividerStyle, section.dividerAtBottom)}
          </div>
        );

      case 'two_columns':
        return (
          <div key={section.id} className="mb-4">
            <div className="text-xs grid grid-cols-2 gap-4">
              {/* Column 1 */}
              <div className="space-y-1">
                {section.column1.map((field, idx) => (
                  <div key={idx} className="flex justify-between gap-2">
                    <span className="flex-shrink-0">{field.title}</span>
                    <span className="text-right">{field.value}</span>
                  </div>
                ))}
              </div>
              {/* Column 2 */}
              <div className="space-y-1">
                {section.column2.map((field, idx) => (
                  <div key={idx} className="flex justify-between gap-2">
                    <span className="flex-shrink-0">{field.title}</span>
                    <span className="text-right">{field.value}</span>
                  </div>
                ))}
              </div>
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
    
    // Realistic receipt textures matching reference examples
    const textures = {
      // Texture 1: Very light, minimal creases (cleanest)
      texture1: [
        'radial-gradient(ellipse 800px 600px at 60% 40%, rgba(0,0,0,0.008), transparent)',
        'radial-gradient(ellipse 600px 400px at 30% 70%, rgba(0,0,0,0.006), transparent)',
        'linear-gradient(25deg, transparent 45%, rgba(0,0,0,0.012) 48%, rgba(0,0,0,0.018) 50%, rgba(0,0,0,0.012) 52%, transparent 55%)',
        'linear-gradient(155deg, transparent 60%, rgba(0,0,0,0.01) 63%, rgba(0,0,0,0.015) 65%, rgba(0,0,0,0.01) 67%, transparent 70%)',
      ].join(', '),
      
      // Texture 2: Light wrinkles with some diagonal creases
      texture2: [
        'radial-gradient(ellipse 700px 500px at 50% 50%, rgba(0,0,0,0.015), transparent)',
        'linear-gradient(30deg, transparent 30%, rgba(0,0,0,0.015) 35%, rgba(0,0,0,0.025) 38%, rgba(0,0,0,0.015) 41%, transparent 46%)',
        'linear-gradient(145deg, transparent 55%, rgba(0,0,0,0.012) 60%, rgba(0,0,0,0.022) 63%, rgba(0,0,0,0.012) 66%, transparent 71%)',
        'linear-gradient(-25deg, transparent 65%, rgba(0,0,0,0.01) 70%, rgba(0,0,0,0.018) 72%, rgba(0,0,0,0.01) 74%, transparent 79%)',
        'radial-gradient(ellipse 400px 300px at 75% 25%, rgba(0,0,0,0.01), transparent)',
      ].join(', '),
      
      // Texture 3: Medium crumpling with multiple wrinkles
      texture3: [
        'radial-gradient(ellipse 600px 450px at 45% 55%, rgba(0,0,0,0.02), transparent)',
        'linear-gradient(35deg, transparent 20%, rgba(0,0,0,0.02) 28%, rgba(0,0,0,0.035) 32%, rgba(0,0,0,0.02) 36%, transparent 44%)',
        'linear-gradient(120deg, transparent 45%, rgba(0,0,0,0.018) 52%, rgba(0,0,0,0.03) 56%, rgba(0,0,0,0.018) 60%, transparent 67%)',
        'linear-gradient(-40deg, transparent 50%, rgba(0,0,0,0.015) 58%, rgba(0,0,0,0.028) 62%, rgba(0,0,0,0.015) 66%, transparent 74%)',
        'linear-gradient(160deg, transparent 35%, rgba(0,0,0,0.012) 42%, rgba(0,0,0,0.022) 45%, rgba(0,0,0,0.012) 48%, transparent 55%)',
        'radial-gradient(ellipse 500px 350px at 20% 80%, rgba(0,0,0,0.015), transparent)',
      ].join(', '),
      
      // Texture 4: Heavy crumpling with many overlapping creases
      texture4: [
        'radial-gradient(ellipse 550px 400px at 50% 50%, rgba(0,0,0,0.025), transparent)',
        'linear-gradient(25deg, transparent 15%, rgba(0,0,0,0.025) 25%, rgba(0,0,0,0.045) 30%, rgba(0,0,0,0.025) 35%, transparent 45%)',
        'linear-gradient(115deg, transparent 30%, rgba(0,0,0,0.022) 40%, rgba(0,0,0,0.04) 45%, rgba(0,0,0,0.022) 50%, transparent 60%)',
        'linear-gradient(-35deg, transparent 40%, rgba(0,0,0,0.02) 50%, rgba(0,0,0,0.038) 55%, rgba(0,0,0,0.02) 60%, transparent 70%)',
        'linear-gradient(155deg, transparent 25%, rgba(0,0,0,0.018) 35%, rgba(0,0,0,0.032) 40%, rgba(0,0,0,0.018) 45%, transparent 55%)',
        'linear-gradient(65deg, transparent 55%, rgba(0,0,0,0.015) 65%, rgba(0,0,0,0.028) 70%, rgba(0,0,0,0.015) 75%, transparent 85%)',
        'radial-gradient(ellipse 450px 300px at 70% 30%, rgba(0,0,0,0.018), transparent)',
        'radial-gradient(ellipse 400px 280px at 25% 75%, rgba(0,0,0,0.02), transparent)',
      ].join(', '),
      
      // Texture 5: Very heavily crumpled (most wrinkled)
      texture5: [
        'radial-gradient(ellipse 500px 380px at 48% 52%, rgba(0,0,0,0.03), transparent)',
        'linear-gradient(22deg, transparent 10%, rgba(0,0,0,0.028) 22%, rgba(0,0,0,0.05) 28%, rgba(0,0,0,0.028) 34%, transparent 46%)',
        'linear-gradient(108deg, transparent 25%, rgba(0,0,0,0.025) 37%, rgba(0,0,0,0.048) 43%, rgba(0,0,0,0.025) 49%, transparent 61%)',
        'linear-gradient(-42deg, transparent 35%, rgba(0,0,0,0.023) 47%, rgba(0,0,0,0.042) 53%, rgba(0,0,0,0.023) 59%, transparent 71%)',
        'linear-gradient(148deg, transparent 18%, rgba(0,0,0,0.02) 30%, rgba(0,0,0,0.038) 36%, rgba(0,0,0,0.02) 42%, transparent 54%)',
        'linear-gradient(72deg, transparent 48%, rgba(0,0,0,0.018) 60%, rgba(0,0,0,0.035) 66%, rgba(0,0,0,0.018) 72%, transparent 84%)',
        'linear-gradient(-18deg, transparent 58%, rgba(0,0,0,0.015) 68%, rgba(0,0,0,0.03) 73%, rgba(0,0,0,0.015) 78%, transparent 88%)',
        'radial-gradient(ellipse 420px 290px at 68% 28%, rgba(0,0,0,0.022), transparent)',
        'radial-gradient(ellipse 380px 260px at 22% 72%, rgba(0,0,0,0.025), transparent)',
        'radial-gradient(ellipse 350px 240px at 85% 60%, rgba(0,0,0,0.018), transparent)',
      ].join(', '),
    };
    
    return {
      backgroundColor: 'white',
      backgroundImage: textures[settings.backgroundTexture as keyof typeof textures] || textures.texture1,
    };
  };

  const getReceiptWidth = () => {
    const width = settings.receiptWidth || '80mm';
    return width === '57mm' ? '216px' : '300px';
  };

  return (
    <div className="relative">
      <div 
        ref={ref}
        className="p-8 shadow-lg mx-auto relative"
        style={{ 
          maxWidth: getReceiptWidth(),
          fontFamily: getFontFamily(settings.font),
          fontSize: getFontSize(settings.font),
          color: settings.textColor,
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
          overflow: 'hidden',
          ...getBackgroundStyle()
        }}
      >
        {sections.map(renderSection)}
        {showWatermark && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 flex flex-col justify-around">
              {[...Array(6)].map((_, rowIndex) => (
                <div key={rowIndex} className="flex justify-around items-center">
                  {[...Array(3)].map((_, colIndex) => (
                    <div
                      key={colIndex}
                      className="text-gray-300 font-semibold transform rotate-[-45deg] whitespace-nowrap"
                      style={{ fontSize: '1.5rem', opacity: 0.15 }}
                    >
                      Sample
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptPreview;
