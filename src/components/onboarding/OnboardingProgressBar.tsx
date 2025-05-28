
import React from 'react';
import { motion } from 'framer-motion';

interface OnboardingProgressBarProps {
  progress: number;
}

export const OnboardingProgressBar: React.FC<OnboardingProgressBarProps> = ({
  progress
}) => {
  return (
    <div className="h-1 bg-gray-200">
      <motion.div
        className="h-full bg-gradient-to-r from-primary to-primary/80"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
};
