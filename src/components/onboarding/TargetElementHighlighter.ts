
import { OnboardingStep } from './steps/OnboardingSteps';
import { NavigateFunction } from 'react-router-dom';

export const highlightTargetElement = (
  selector: string | null,
  targetStepIndex: number, 
  steps: OnboardingStep[],
  navigate: NavigateFunction,
  onStepComplete: (stepIndex: number) => void
): (() => void) | undefined => {
  if (!selector) return;
  
  // Remove any existing highlights
  const existingHighlight = document.querySelector('.onboarding-highlight');
  if (existingHighlight) {
    existingHighlight.remove();
  }

  // Find the target element
  const targetElement = document.querySelector(selector);
  if (!targetElement) {
    console.log(`Target element for step ${targetStepIndex} not found with selector: ${selector}`);
    return;
  }
  
  console.log(`Found target element for step ${targetStepIndex}:`, targetElement);
  
  // Create highlight element
  const highlight = document.createElement('div');
  highlight.className = 'onboarding-highlight fixed z-50 animate-pulse';
  
  // Position the highlight near the target element
  const rect = targetElement.getBoundingClientRect();
  highlight.style.top = `${rect.top + rect.height}px`;
  highlight.style.left = `${rect.left + rect.width / 2 - 10}px`;
  
  // Create arrow element
  const arrow = document.createElement('div');
  arrow.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="m6 9 6 6 6-6"/></svg>`;
  
  highlight.appendChild(arrow);
  document.body.appendChild(highlight);
  
  // Add click listener to the target element
  const handleTargetClick = () => {
    console.log(`Target element clicked for step ${targetStepIndex}`);
    // Remove highlight
    highlight.remove();
    
    // Navigate to the route if specified
    const step = steps[targetStepIndex];
    if (step && step.route) {
      navigate(step.route);
    }
    
    // Advance to next step after a small delay to allow navigation
    setTimeout(() => {
      onStepComplete(targetStepIndex);
    }, 500);
    
    // Remove this event listener
    targetElement.removeEventListener('click', handleTargetClick);
  };
  
  targetElement.addEventListener('click', handleTargetClick);
  
  // Return cleanup function
  return () => {
    targetElement.removeEventListener('click', handleTargetClick);
    highlight.remove();
  };
};

export const onboardingStyles = `
  .onboarding-highlight {
    color: var(--kontrola-600, #6c63ff);
    filter: drop-shadow(0 0 8px rgba(108, 99, 255, 0.5));
    pointer-events: none;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
  }
`;
