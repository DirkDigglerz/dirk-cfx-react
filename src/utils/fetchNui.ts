import { isEnvBrowser } from "./misc";

/**
 * Simple wrapper around fetch API tailored for CEF/NUI use. This abstraction
 * can be extended to include AbortController if needed or if the response isn't
 * JSON. Tailor it to your needs.
 *
 * @param eventName - The endpoint eventname to target
 * @param data - Data you wish to send in the NUI Callback
 * @param mockData - Mock data to be returned if in the browser
 *
 * @return returnData - A promise for the data sent back by the NuiCallbacks CB argument
 */

export async function fetchNui<T = unknown>(
  eventName: string,
  data?: unknown,
  mockData?: T,
): Promise<T> {
  const options = {
    method: "post",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(data),
  };
  if (isEnvBrowser() && mockData !== undefined) return mockData;
  if (isEnvBrowser()) {
    console.warn(
      `[fetchNui] Called fetchNui for event "${eventName}" in browser environment without mockData. Returning empty object.`,
    );
    return {} as T;
  }

  const resourceName = (window as any).GetParentResourceName
    ? (window as any).GetParentResourceName()
    : "nui-frame-app";

  const resp = await fetch(`https://${resourceName}/${eventName}`, options);

  const respFormatted = await resp.json();

  return respFormatted;
}

/**
 * fetchOnLoad — triggers fetchNui immediately when called.
 * Can safely be used anywhere (even top-level, outside React).
 *
 * Usage:
 *   fetchOnLoad<MyType>("getData").then(data => myStore.setState({ data }));
 */
export function fetchOnLoad<T = unknown>(
  eventName: string,
  data?: unknown,
  mockData?: T
): Promise<T> {
  // just call it directly
  return fetchNui<T>(eventName, data, mockData)
    .catch((err) => {
      console.error(`[fetchOnLoad] Failed for ${eventName}:`, err);
      throw err;
    });
}


export const fetchLuaTable = <T>(tableName: string) => () => {
  if (isEnvBrowser()) {
    return Promise.resolve({} as T);
  }
  return fetchNui<T>('GET_LUA_TABLE', { tableName });
};

