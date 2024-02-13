// src/components/DeviceSelect.js
import React from 'react';

const DeviceSelect = ({ deviceIds, selectedDeviceId, onChange }) => {
    return (
        <div>
            <label htmlFor="deviceSelect">Select Device ID:</label>
            <select
                id="deviceSelect"
                value={selectedDeviceId}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="">Select Device ID</option>
                {deviceIds.map((deviceId) => (
                    <option key={deviceId} value={deviceId}>
                        {deviceId}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default DeviceSelect;
