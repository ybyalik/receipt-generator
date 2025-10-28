import React, { useState } from 'react';
import { FiSettings, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import type { TemplateSettings, CurrencySymbol, CurrencyFormat, FontStyle } from '../lib/types';

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
    <div className="border rounded-lg bg-gray-50 mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FiSettings className="text-gray-600" />
          <span className="font-semibold text-gray-900">Settings</span>
        </div>
        {isExpanded ? <FiChevronUp className="text-gray-600" /> : <FiChevronDown className="text-gray-600" />}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Currency Section */}
          <div>
            <label className="block text-sm font-medium mb-2">Currency</label>
            <div className="flex gap-2">
              {(['$', '€', '£', '¥', '₹'] as CurrencySymbol[]).map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => onUpdate({ ...settings, currency: symbol })}
                  className={`px-4 py-2 border rounded transition-colors ${
                    settings.currency === symbol
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Format Section */}
          <div>
            <label className="block text-sm font-medium mb-2">Format</label>
            <div className="flex gap-2">
              {(['symbol_before', 'symbol_after', 'symbol_after_space'] as CurrencyFormat[]).map((format) => (
                <button
                  key={format}
                  onClick={() => onUpdate({ ...settings, currencyFormat: format })}
                  className={`px-4 py-2 border rounded transition-colors ${
                    settings.currencyFormat === format
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {formatExample(settings.currency, format)}
                </button>
              ))}
            </div>
          </div>

          {/* Font Section */}
          <div>
            <label className="block text-sm font-medium mb-2">Font</label>
            <div className="flex gap-2">
              <button
                onClick={() => onUpdate({ ...settings, font: 'handwritten' })}
                className={`px-6 py-2 border rounded transition-colors ${
                  settings.font === 'handwritten'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                style={{ fontFamily: 'Caveat, cursive' }}
              >
                Font 1
              </button>
              <button
                onClick={() => onUpdate({ ...settings, font: 'mono' })}
                className={`px-6 py-2 border rounded transition-colors ${
                  settings.font === 'mono'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                style={{ fontFamily: 'Courier New, monospace' }}
              >
                Font 2
              </button>
              <button
                onClick={() => onUpdate({ ...settings, font: 'receipt' })}
                className={`px-6 py-2 border rounded transition-colors ${
                  settings.font === 'receipt'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                style={{ fontFamily: 'monospace' }}
              >
                Font 3
              </button>
            </div>
          </div>

          {/* Text Color Section */}
          <div>
            <label className="block text-sm font-medium mb-2">Text color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.textColor}
                onChange={(e) => onUpdate({ ...settings, textColor: e.target.value })}
                className="w-16 h-10 border rounded cursor-pointer"
              />
              <span className="text-sm text-gray-600">{settings.textColor}</span>
            </div>
          </div>

          {/* Background Toggle */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showBackground}
                onChange={(e) => onUpdate({ ...settings, showBackground: e.target.checked })}
                className="w-5 h-5 rounded"
              />
              <span className="text-sm font-medium">Show receipt background</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
