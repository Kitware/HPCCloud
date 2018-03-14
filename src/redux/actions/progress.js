export const SETUP_PROGRESS = 'SETUP_PROGRESS';
export const ON_SOME_PROGRESS = 'ON_PROGRESS';
export const RESET_PROGRESS = 'RESET_PROGRESS';

export function setupProgress(total) {
  return { type: SETUP_PROGRESS, total };
}

export function onProgress(current) {
  return { type: ON_SOME_PROGRESS, current };
}

export function resetProgress(val) {
  return { type: RESET_PROGRESS, val };
}
