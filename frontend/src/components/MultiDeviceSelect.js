
import React from 'react';
import './styles.css';

const MultiDeviceSelect = ({ deviceIds, selectedDeviceIds, onChange }) => {
    const handleCheckboxChange = (event) => {
        const deviceId = event.target.value;
        const isChecked = event.target.checked;

        if (isChecked) {
            onChange([...selectedDeviceIds, deviceId]);
        } else {
            onChange(selectedDeviceIds.filter((id) => id !== deviceId));
        }
    };

    return (
        <div>
            <label>Select Devices:</label>
            {deviceIds.map((deviceId) => (
                <div key={deviceId}>
                    <input
                        type="checkbox"
                        value={deviceId}
                        checked={selectedDeviceIds.includes(deviceId)}
                        onChange={handleCheckboxChange}
                    />
                    <label>{deviceId}</label>
                </div>
            ))}
        </div>
    );
};

export default MultiDeviceSelect;
