import { createMutable } from 'solid-js/store';

/**
 * Utility object for managing URL query parameters and shape state for permalinks.
 * Provides methods to read, write, and synchronize shape and parameter data with the browser URL.
 */
const PermaLink = {
  /**
   * Updates the browser URL's query parameters with the provided entries.
   * All previous search parameters are removed before setting new ones.
   * @param entries - Key/value pairs to set as query parameters.
   */
  setQueryParams(entries: Record<string, string>) {
    const url = new URL(window.location.href);

    // Remove all searchParams
    url.search = '';

    // Add all entries, removing those that are null, undefined or empty string
    Object.entries(entries).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    history.pushState({}, '', url);
  },

  timeout: null as ReturnType<typeof setTimeout> | null,

  /**
   * Saves the current shape and parameters to the browser URL as query parameters.
   * The shape is included as the 'shape' parameter if present.
   */
  saveToUrl() {
    const params = { ...PermaLink.getParams() };

    if (PermaLink.getShape()) {
      params['shape'] = PermaLink.getShape();
    }

    // debounce URL updates to avoid excessive history entries
    if (PermaLink.timeout) clearTimeout(PermaLink.timeout);
    PermaLink.timeout = setTimeout(() => {
      PermaLink.setQueryParams(params);
    }, 500)
  },

  /**
   * Loads parameters and shape from the browser URL's query parameters into mutable state.
   * The 'shape' parameter is handled separately from other parameters.
   */
  loadFromUrl() {
    const url = new URL(window.location.href);
    const params: Record<string, string> = {};

    url.searchParams.forEach((value, key) => {
      if (key === 'shape') {
        PermaLink.setShape(value);
        return;
      }
      params[key] = value;
    });

    PermaLink.mutable.params = params;
  },

  /**
   * Sets a string parameter in the mutable state.
   * @param name - Parameter name.
   * @param param - Parameter value as string.
   */
  setParam(name: string, param: string) {
    PermaLink.mutable.params[name] = param;
  },

  /**
   * Gets a string parameter from the mutable state.
   * @param name - Parameter name.
   * @returns The parameter value as string, or undefined if not set.
   */
  getParam(name: string) {
    return PermaLink.mutable.params[name];
  },

  /**
   * Sets a boolean parameter in the mutable state as a string ('true' or 'false').
   * @param name - Parameter name.
   * @param param - Boolean value to store.
   */
  setParamBoolean(name: string, param: boolean) {
    PermaLink.setParam(name, param ? 'true' : 'false');
  },

  /**
   * Gets a numeric parameter from the mutable state.
   * @param name - Parameter name.
   * @returns The parameter value as number, or null if not set or not a valid number.
   */
  getParamNumber(name: string) {
    const param = PermaLink.mutable.params[name];
    if (!param) return null;
    const num = Number(param);
    return isNaN(num) ? null : num;
  },

  /**
   * Gets a boolean parameter from the mutable state.
   * @param name - Parameter name.
   * @returns True if the parameter is 'true', false if 'false', or null if not set.
   */
  getParamBoolean(name: string) {
    const param = PermaLink.mutable.params[name];
    if (!param) return null;
    return param === 'true';
  },

  /**
   * Gets all current parameters from the mutable state.
   * @returns An object containing all parameter key/value pairs.
   */
  getParams() {
    return PermaLink.mutable.params;
  },

  /**
   * Sets the shape value in the mutable state.
   * @param shape - The shape name to store.
   */
  setShape(shape: string) {
    PermaLink.mutable.shape = shape;
  },

  /**
   * Gets the current shape value from the mutable state.
   * @returns The shape name as string, or null if not set.
   */
  getShape() {
    return PermaLink.mutable.shape;
  },

  /**
   * Clears all parameters from the mutable state.
   */
  clearParams() {
    // PermaLink.mutable.params = {};
  },

  clearParam(name: string) {
    delete PermaLink.mutable.params[name];
  },

  /**
   * Mutable state object containing the current shape and parameters.
   * Used for synchronizing state with the URL and application logic.
   */
  mutable: createMutable<{
    shape: string | null;
    params: Record<string, string>;
  }>({
    shape: null,
    params: {},
  }),
};

export default PermaLink;
