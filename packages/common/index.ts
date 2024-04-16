export * from './area';
export * from './length';
export * from './measure';
export * from './units';
export * from './mapControl';
export * from './modal';
export * from './tileTranslate';

export type TControlPostion = "top-left" | "top-right" | "bottom-left" | "bottom-right";
export type TOS = "mobile" | "pc";

export function debounce<T extends Function>(func: T, delay: number, immediate: boolean = true): T {
    let timer: NodeJS.Timeout | undefined;
    let hasExecutedImmediately = false;

    return function (this: any, ...args: any[]) {
        if (timer) clearTimeout(timer);
        
        if (immediate && !hasExecutedImmediately) {
            func.apply(this, args);
            hasExecutedImmediately = true;
        }

        timer = setTimeout(() => {
            if(!immediate || hasExecutedImmediately){
                func.apply(this, args);
            }

            hasExecutedImmediately = false;
        }, delay);
    } as any
}

import "./index.css";