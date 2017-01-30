import * as router from 'react-router-redux';

// API push(location), replace(location), go(number), goBack(), goForward()
export const go = (number) => router.go(number);
export const goBack = () => router.goBack();
export const goForward = () => router.goForward();
export const push = (location) => router.push(location);
export const replace = (location) => router.replace(location);
