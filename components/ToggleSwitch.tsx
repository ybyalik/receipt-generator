import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export default function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-14 h-8 rounded-full transition-colors duration-200 ease-in-out ${
            checked ? 'bg-navy-700' : 'bg-gray-200 border-2 border-gray-300'
          }`}
        >
          <div
            className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform duration-200 ease-in-out ${
              checked ? 'translate-x-6' : 'translate-x-0'
            }`}
            style={{
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          />
        </div>
      </div>
      {label && <span className="ml-3 text-sm font-medium text-navy-700">{label}</span>}
    </label>
  );
}
