import React, { useState, useEffect } from 'react';
import { Tabs, Tab } from '@mui/material';

function MyTabs() {
    const validTabs = ['DRT', 'HSG2', 'RDWG', 'GD'];
    const [selectedTab, setSelectedTab] = useState('DRT');

    // Force re-render with valid value if somehow invalid
    useEffect(() => {
        if (!validTabs.includes(selectedTab) || selectedTab === '') {
            console.log('MyTabs: Invalid value detected, resetting to DRT', selectedTab);
            setSelectedTab('DRT');
        }
    }, [selectedTab, validTabs]);

    const handleChange = (event, newValue) => {
        console.log('MyTabs: handleChange called with', newValue);
        if (validTabs.includes(newValue) && newValue !== '') {
            setSelectedTab(newValue);
        }
    };

    // Triple protection against invalid values
    const safeValue = (validTabs.includes(selectedTab) && selectedTab !== '') ? selectedTab : 'DRT';

    console.log('MyTabs: Rendering with safeValue', safeValue);

    return (
        <Tabs
            value={safeValue}
            onChange={handleChange}
            data-testid="MyTabsComponent"
        >
            <Tab label="DRT" value="DRT" />
            <Tab label="HSG2" value="HSG2" />
            <Tab label="RDWG" value="RDWG" />
            <Tab label="GD" value="GD" />
        </Tabs>
    );
}

export default MyTabs;
