/** Espaces insécables avant ? ! : (typographie française). Identique au `nb` du prototype. */
export const nb = (t: string): string => t.replace(/ ([?!:])/g, '\u00a0$1');
