export function getDeltaStep(steps, currentStep, delta=1) {
    const idx = steps.indexOf(currentStep) + delta;
    if(idx > -1 && idx < steps.length) {
        return steps[idx];
    }
    return null;
}
