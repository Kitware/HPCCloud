import girder from './GirderClient';

export function onBusy(callback) {
    return girder.onBusy(callback);
}
