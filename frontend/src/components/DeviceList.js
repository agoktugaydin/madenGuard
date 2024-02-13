// DeviceList.js

import React from 'react';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';

const DeviceList = ({ deviceIds, selectedDeviceIds, onDeviceSelect }) => {
    return (
        <div className="checkbox-container"> {/* Yeni eklenen div */}
            <FormGroup>
                {deviceIds.map((deviceId) => (
                    <FormControlLabel
                        key={deviceId}
                        control={
                            <Checkbox
                                checked={selectedDeviceIds.includes(deviceId)}
                                onChange={() => onDeviceSelect(deviceId)}
                            />
                        }
                        label={deviceId}
                    />
                ))}
            </FormGroup>
        </div>
    );
};

export default DeviceList;
