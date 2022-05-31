import {LOCAL_STORAGE_EXISTS, NATIVE_STORAGE_EXISTS} from "../constants";
import { SALEOR_AUTH_PLUGIN_ID, SALEOR_CSRF_TOKEN } from "./constants";

let AsyncStorage: any;
if (NATIVE_STORAGE_EXISTS) {
  AsyncStorage = require('@react-native-async-storage/async-storage');
}

export let storage: {
  setAuthPluginId: (method: string | null) => void;
  getAuthPluginId: () => string | null;
  setAccessToken: (token: string | null) => void;
  getAccessToken: () => string | null;
  setCSRFToken: (token: string | null) => void;
  getCSRFToken: () => string | null;
  setTokens: (tokens: {
    accessToken: string | null;
    csrfToken: string | null;
  }) => void;
  clear: () => void;
};

interface StorageProvider {
  getItem: (key: string) => Promise<null | string>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

const getStorageProvider = (): StorageProvider => {
  let getItem, setItem, removeItem;
  if (LOCAL_STORAGE_EXISTS) {
    getItem = async (key: string) => localStorage.getItem(key);
    setItem = async (key: string, value: string) => localStorage.setItem(key, value);
    removeItem = async (key: string) => localStorage.removeItem(key);
  } else if (NATIVE_STORAGE_EXISTS) {
    getItem = AsyncStorage.getItem;
    setItem = AsyncStorage.setItem;
    removeItem = AsyncStorage.removeItem;
  } else {
    getItem = async () => null;
    setItem = async () => {};
    removeItem = async () => {};
  }
  return {
    getItem,
    setItem,
    removeItem,
  }
}

export const createStorage = async (autologinEnabled: boolean): Promise<void> => {
  const storageProvider = getStorageProvider();
  let authPluginId = await storageProvider.getItem(SALEOR_AUTH_PLUGIN_ID);
  let accessToken: string | null = null;
  let csrfToken: string | null = autologinEnabled ? await storageProvider.getItem(SALEOR_CSRF_TOKEN) : null;

  const setAuthPluginId = async (pluginId: string | null): Promise<void> => {
    if (pluginId) {
      await storageProvider.setItem(SALEOR_AUTH_PLUGIN_ID, pluginId);
    } else {
      await storageProvider.removeItem(SALEOR_AUTH_PLUGIN_ID);
    }

    authPluginId = pluginId;
  };

  const setCSRFToken = async (token: string | null): void => {
    if (autologinEnabled) {
      if (token) {
        await storageProvider.setItem(SALEOR_CSRF_TOKEN, token);
      } else {
        await storageProvider.removeItem(SALEOR_CSRF_TOKEN);
      }
    }

    csrfToken = token;
  };
  const setAccessToken = (token: string | null): void => {
    accessToken = token;
  };

  const getAuthPluginId = (): string | null => authPluginId;
  const getAccessToken = (): string | null => accessToken;
  const getCSRFToken = (): string | null => csrfToken;

  const setTokens = ({
    accessToken,
    csrfToken,
  }: {
    accessToken: string | null;
    csrfToken: string | null;
  }): void => {
    setAccessToken(accessToken);
    setCSRFToken(csrfToken);
  };

  const clear = (): void => {
    setAuthPluginId(null);
    setAccessToken(null);
    setCSRFToken(null);
  };

  storage = {
    setAuthPluginId,
    setAccessToken,
    setCSRFToken,
    getAuthPluginId,
    getAccessToken,
    getCSRFToken,
    setTokens,
    clear,
  };
};
