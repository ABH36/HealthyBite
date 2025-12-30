import React from 'react';
import { HeartPulse, Brain, Zap, Syringe, Activity, AlertOctagon, Ban } from 'lucide-react';

export const getRiskIcon = (category) => {
    switch (category) {
        case 'Heart Poison':
            return <HeartPulse className="text-red-500" size={24} />;
        case 'Brain Poison':
            return <Brain className="text-purple-500" size={24} />;
        case 'Sugar Shock':
            return <Zap className="text-yellow-500" size={24} />;
        case 'Hormone Killer':
            return <Syringe className="text-pink-500" size={24} />;
        case 'Cancer Linked':
            return <Activity className="text-red-600" size={24} />;
        case 'Liver/Kidney Damage':
            return <AlertOctagon className="text-orange-600" size={24} />;
        default:
            return <Ban className="text-gray-400" size={24} />;
    }
};