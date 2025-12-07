import React from 'react';

const RadioGroup = ({ options, name, selectedValue, onChange }) => {
    return (
        <div className="radio-group">
            {options.map(option => (
                <label key={option.value} className="radio-label">
                    <input
                        type="radio"
                        name={name}
                        value={option.value}
                        checked={selectedValue === option.value}
                        onChange={onChange}
                        className="radio-input"
                    />
                    {option.label}
                </label>
            ))}
        </div>
    );
};

export default RadioGroup;