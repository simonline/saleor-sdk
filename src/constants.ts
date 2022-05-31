const AsyncStorage = require('@react-native-async-storage/async-storage');

export const WINDOW_EXISTS = typeof window !== "undefined";
export const LOCAL_STORAGE_EXISTS = WINDOW_EXISTS && !!window.localStorage;
export const NATIVE_STORAGE_EXISTS = !!AsyncStorage;
export const DEVELOPMENT_MODE = process.env.NODE_ENV === "development";
