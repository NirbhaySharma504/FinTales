import React from 'react';

interface SelectProps {
    options: Array<{ value: string; label: string }>;
    onChange: (value: string) => void;
    value?: string;
    label?: string;
    placeholder?: string;
}

const Select: React.FC<SelectProps> = ({ options, onChange, value, label, placeholder }) => {
    return (
        <div className="select-container">
            {label && <label className="select-label">{label}</label>}
            <select
                className="select-dropdown"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default Select;