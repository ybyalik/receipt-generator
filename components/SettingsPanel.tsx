import React, { useState } from 'react';
import { FiSettings, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import type { TemplateSettings, CurrencyFormat, FontStyle, BackgroundTexture, ReceiptWidth } from '../lib/types';

interface SettingsPanelProps {
  settings: TemplateSettings;
  onUpdate: (settings: TemplateSettings) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatExample = (symbol: string, format: CurrencyFormat) => {
    switch (format) {
      case 'symbol_before':
        return `${symbol}2.99`;
      case 'symbol_after':
        return `2.99${symbol}`;
      case 'symbol_after_space':
        return `2.99 ${symbol}`;
    }
  };

  return (
    <div className="border border-gray-300 rounded-xl bg-white mb-6 shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-navy-50 transition-colors rounded-xl cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <FiSettings className="text-accent-500" />
          <span className="font-semibold text-navy-900">Global Settings</span>
        </div>
        {isExpanded ? <FiChevronUp className="text-navy-600" /> : <FiChevronDown className="text-navy-600" />}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-6 border-t border-navy-100">
          {/* Currency and Format Section */}
          <div className="grid grid-cols-[auto_1fr] gap-4 items-start pt-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-navy-700">Currency</label>
              <input
                type="text"
                value={settings.currency}
                onChange={(e) => onUpdate({ ...settings, currency: e.target.value })}
                placeholder="$"
                maxLength={5}
                className="w-16 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-center font-medium bg-white cursor-text"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-navy-700">Format</label>
              <div className="flex gap-2 flex-wrap">
                {(['symbol_before', 'symbol_after', 'symbol_after_space'] as CurrencyFormat[]).map((format) => (
                  <button
                    key={format}
                    onClick={() => onUpdate({ ...settings, currencyFormat: format })}
                    className={`px-4 py-2 border rounded-lg transition-all font-medium cursor-pointer ${
                      settings.currencyFormat === format
                        ? 'bg-gray-100 text-gray-900 border-gray-300 shadow-sm'
                        : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {formatExample(settings.currency, format)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Font Section */}
          <div>
            <label className="block text-sm font-medium mb-2 text-navy-700">Font Style</label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => onUpdate({ ...settings, font: 'mono' })}
                className={`px-6 py-2 border rounded-lg transition-all cursor-pointer ${
                  settings.font === 'mono'
                    ? 'bg-gray-100 text-gray-900 border-gray-300 shadow-sm'
                    : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                }`}
                style={{ fontFamily: 'Courier New, monospace' }}
              >
                Monospace
              </button>
              <button
                onClick={() => onUpdate({ ...settings, font: 'receipt' })}
                className={`px-6 py-2 border rounded-lg transition-all cursor-pointer ${
                  settings.font === 'receipt'
                    ? 'bg-gray-100 text-gray-900 border-gray-300 shadow-sm'
                    : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                }`}
                style={{ fontFamily: 'monospace' }}
              >
                Receipt
              </button>
              <button
                onClick={() => onUpdate({ ...settings, font: 'courier' })}
                className={`px-6 py-2 border rounded-lg transition-all cursor-pointer ${
                  settings.font === 'courier'
                    ? 'bg-gray-100 text-gray-900 border-gray-300 shadow-sm'
                    : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                }`}
                style={{ fontFamily: 'Courier New, monospace', fontSize: '10pt' }}
              >
                Courier New
              </button>
              <button
                onClick={() => onUpdate({ ...settings, font: 'consolas' })}
                className={`px-6 py-2 border rounded-lg transition-all cursor-pointer ${
                  settings.font === 'consolas'
                    ? 'bg-gray-100 text-gray-900 border-gray-300 shadow-sm'
                    : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                }`}
                style={{ fontFamily: 'Consolas, Monaco, monospace', fontSize: '11pt' }}
              >
                Consolas
              </button>
              <button
                onClick={() => onUpdate({ ...settings, font: 'custom' })}
                className={`px-6 py-2 border rounded-lg transition-all cursor-pointer ${
                  settings.font === 'custom'
                    ? 'bg-gray-100 text-gray-900 border-gray-300 shadow-sm'
                    : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                }`}
                style={{ fontFamily: 'Custom Receipt, Courier New, monospace', fontSize: '11pt' }}
              >
                Custom Receipt
              </button>
              <button
                onClick={() => onUpdate({ ...settings, font: 'bit' })}
                className={`px-6 py-2 border rounded-lg transition-all cursor-pointer ${
                  settings.font === 'bit'
                    ? 'bg-gray-100 text-gray-900 border-gray-300 shadow-sm'
                    : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                }`}
                style={{ fontFamily: 'BIT Receipt, Courier New, monospace', fontSize: '10pt' }}
              >
                BIT Receipt
              </button>
              <button
                onClick={() => onUpdate({ ...settings, font: 'ocrb' })}
                className={`px-6 py-2 border rounded-lg transition-all cursor-pointer ${
                  settings.font === 'ocrb'
                    ? 'bg-gray-100 text-gray-900 border-gray-300 shadow-sm'
                    : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                }`}
                style={{ fontFamily: 'OCRB Receipt, Courier New, monospace', fontSize: '10pt' }}
              >
                OCRB Receipt
              </button>
            </div>
          </div>

          {/* Text Color Section */}
          <div>
            <label className="block text-sm font-medium mb-2 text-navy-700">Text Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.textColor}
                onChange={(e) => onUpdate({ ...settings, textColor: e.target.value })}
                className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <span className="text-sm text-navy-900 font-mono">{settings.textColor}</span>
            </div>
          </div>

          {/* Background Texture Section */}
          <div>
            <label className="block text-sm font-medium mb-2 text-navy-700">Receipt Background Texture</label>
            <div className="flex gap-2 flex-wrap">
              {(['none', 'texture1', 'texture2', 'texture3', 'texture4', 'texture5'] as BackgroundTexture[]).map((texture, index) => (
                <button
                  key={texture}
                  onClick={() => onUpdate({ ...settings, backgroundTexture: texture })}
                  className={`px-4 py-2 border rounded-lg transition-all font-medium cursor-pointer ${
                    settings.backgroundTexture === texture
                      ? 'bg-gray-100 text-gray-900 border-gray-300 shadow-sm'
                      : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {texture === 'none' ? 'Off' : `Texture ${index}`}
                </button>
              ))}
            </div>
          </div>

          {/* Receipt Width Section */}
          <div>
            <label className="block text-sm font-medium mb-2 text-navy-700">Receipt Width</label>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: '57mm', label: '2¼" (57mm)', description: 'Small retail' },
                { value: '80mm', label: '3⅛" (80mm)', description: 'Standard POS' }
              ].map(({ value, label, description }) => (
                <button
                  key={value}
                  onClick={() => onUpdate({ ...settings, receiptWidth: value as ReceiptWidth })}
                  className={`px-4 py-2 border rounded-lg transition-all cursor-pointer ${
                    (settings.receiptWidth || '80mm') === value
                      ? 'bg-gray-100 text-gray-900 border-gray-300 shadow-sm'
                      : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{label}</div>
                  <div className="text-xs text-navy-500">{description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
