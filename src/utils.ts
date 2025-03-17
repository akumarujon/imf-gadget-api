export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

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
