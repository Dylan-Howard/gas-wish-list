import {Product} from './types';
import {GasResponse} from '../types/gas';

const IS_GAS_ENV = typeof google !== 'undefined' && google.script?.run;

/**
 * Generic runner to wrap google.script.run in a Promise
 */
async function runGas<T>(params: {
  key: string;
  action: string;
  [key: string]: string | number | boolean | object | undefined | null;
}): Promise<T> {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((jsonResponse: string) => {
        const res: GasResponse<T> = JSON.parse(jsonResponse);
        if (res.success && res.data !== undefined) {
          resolve(res.data);
        } else {
          reject(new Error(res.error || 'Unknown Server Error'));
        }
      })
      .withFailureHandler(err => reject(err))
      .doGetAsApi(params);
  });
}

export const fetchProducts = async (key: string): Promise<Product[]> => {
  if (IS_GAS_ENV) {
    return runGas<Product[]>({key, action: 'getData'});
  }
  // Local Dev Fallback (Vite Middleware)
  try {
    const res = await fetch(`./api?key=${key}&action=getData`);
    const json = await res.json();
    return json.data || [];
  } catch {
    console.warn(
      'Using fallback empty products list (is the dev server running?)',
    );
    return [];
  }
};

export const updateProduct = async (
  key: string,
  product: Product,
  action: 'UPDATE' | 'MARK_PURCHASED',
): Promise<boolean> => {
  if (IS_GAS_ENV) {
    return runGas<boolean>({key, action, product});
  }
  console.log(`[Local Dev] Action: ${action} for product:`, product);
  return true; // Mock success for local dev
};

export const sendInvite = async (
  key: string,
  email: string,
  url: string,
): Promise<boolean> => {
  if (IS_GAS_ENV) {
    return runGas<boolean>({key, action: 'SEND_INVITE', email, url});
  }
  console.log(`[Local Dev] Sending invite to ${email} with URL: ${url}`);
  return true; // Mock success for local dev
};
