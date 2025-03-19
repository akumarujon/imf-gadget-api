/**
 * Capitalize the text.
 * @param {string} text - Text string to capitalize
 * @returns {string} Capitalized string
 *
 * ### Example:
 * ```typescript
 * const capitalized = capitalize("something")
 * ```
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Checks if the text is capitalized.
 * @param {string} text - Text string to check.
 * @returns {boolean} If the string is capitalized
 *
 * ### Example:
 * ```typescript
 * const check = isCapitalized("Something")
 */
export function isCapitalized(text: string): boolean {
  return text == capitalize(text);
}

// export interface JSONResponse {
//   success: boolean;
//   message: string;
//   data: Gadget | Gadget[];
//   meta: {
//     time: string;
//     requestID: string;
//   };
// }

// export function jsonResponse(args: JSONResponse): JSONResponse {
//   const result: JSONResponse = {
//     success: args.success,
//     message: args.message,
//     data: args.data,
//     meta: { time: args.meta.time, requestID: args.meta.requestID },
//   };

//   return result;
// }
