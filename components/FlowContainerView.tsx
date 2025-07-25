import React, { useState } from 'react';
import { IllbotFlowLandingView } from './IllbotFlowLandingView';
import { IllbotFlowView } from './IllbotFlowView';
import { Mode } from '../types';

interface FlowContainerViewProps {
  logActivity: (action: string, mode: Mode, wordCount?: number) => void;
}

export const FlowContainerView: React.FC<FlowContainerViewProps> = ({ logActivity }) => {
    const [showLanding, setShowLanding] = useState(true);

    const handleStart = () => {
        setShowLanding(false);
    };

    if (showLanding) {
        return <IllbotFlowLandingView onStart={handleStart} />;
    }

    return <IllbotFlowView logActivity={logActivity} />;
};