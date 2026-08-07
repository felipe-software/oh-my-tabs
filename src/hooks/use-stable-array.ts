import { useRef } from "react";

/**
 * Keeps the previous array reference while the next array has equivalent
 * contents. Useful when an upstream library recreates arrays on every render.
 */
export function useStableArray<T>(
    next: readonly T[],
    isEqual: (a: T, b: T) => boolean,
): readonly T[] {
    const ref = useRef(next);
    const previous = ref.current;

    if (
        previous !== next &&
        (previous.length !== next.length ||
            !next.every((value, index) =>
                isEqual(value, previous[index] as T),
            ))
    ) {
        ref.current = next;
    }

    return ref.current;
}
