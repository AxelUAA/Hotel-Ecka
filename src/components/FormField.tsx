'use client';

import React from 'react';

export type FieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'number'
  | 'decimal'
  | 'date'
  | 'select'
  | 'fk';

interface FormFieldProps {
  label: string;
  name: string;
  type: FieldType;
  value: unknown;
  onChange: (name: string, value: unknown) => void;
  required?: boolean;
  options?: string[];
  fkOptions?: { value: number | string; label: string }[];
  help?: string;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

const baseInput =
  'w-full rounded-lg border bg-midnight-700 border-midnight-600 px-3 py-2 text-sm text-ink placeholder:text-ink-dim transition-colors focus:border-brass-500 focus:outline-none focus:ring-1 focus:ring-brass-500/30';

export default function FormField({
  label,
  name,
  type,
  value,
  onChange,
  required,
  options,
  fkOptions,
  help,
  error,
  disabled,
  autoFocus,
}: FormFieldProps) {
  const id = `field-${name}`;
  const strValue = value == null ? '' : String(value);
  const inputCls = `${baseInput}${disabled ? ' opacity-50 cursor-not-allowed' : ''}`;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const raw = e.target.value;
    if (type === 'number' || type === 'decimal' || type === 'fk') {
      onChange(name, raw === '' ? '' : Number(raw));
    } else {
      onChange(name, raw);
    }
  };

  /* ── Render input element ── */
  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select
            id={id}
            name={name}
            value={strValue}
            onChange={handleChange}
            required={required}
            disabled={disabled}
            autoFocus={autoFocus}
            className={inputCls}
          >
            <option value="">— Seleccionar —</option>
            {options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      case 'fk':
        return (
          <select
            id={id}
            name={name}
            value={strValue}
            onChange={handleChange}
            required={required}
            disabled={disabled}
            autoFocus={autoFocus}
            className={inputCls}
          >
            <option value="">— Seleccionar —</option>
            {fkOptions?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'decimal':
        return (
          <input
            id={id}
            name={name}
            type="number"
            step="0.01"
            inputMode="decimal"
            value={strValue}
            onChange={handleChange}
            required={required}
            disabled={disabled}
            autoFocus={autoFocus}
            className={inputCls}
          />
        );

      case 'number':
        return (
          <input
            id={id}
            name={name}
            type="number"
            step="1"
            inputMode="numeric"
            value={strValue}
            onChange={handleChange}
            required={required}
            disabled={disabled}
            autoFocus={autoFocus}
            className={inputCls}
          />
        );

      case 'date':
        return (
          <input
            id={id}
            name={name}
            type="date"
            value={strValue}
            onChange={handleChange}
            required={required}
            disabled={disabled}
            autoFocus={autoFocus}
            className={`${inputCls} [color-scheme:dark]`}
          />
        );

      default:
        return (
          <input
            id={id}
            name={name}
            type={type}
            value={strValue}
            onChange={handleChange}
            required={required}
            disabled={disabled}
            autoFocus={autoFocus}
            placeholder={label}
            className={inputCls}
          />
        );
    }
  };

  return (
    <div className="space-y-1.5">
      {/* Label */}
      <label htmlFor={id} className="block text-sm font-medium text-ink-soft">
        {label}
        {required && <span className="ml-0.5 text-brass-500">*</span>}
      </label>

      {/* Input */}
      {renderInput()}

      {/* Help text */}
      {help && !error && (
        <p className="text-xs text-ink-dim">{help}</p>
      )}

      {/* Error text */}
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
