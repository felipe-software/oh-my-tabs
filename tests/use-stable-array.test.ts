import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test";
import * as React from "react";

interface Item {
    id: number;
}

interface Ref<T> {
    current: T;
}

let hookRef: Ref<unknown> | undefined;

mock.module("react", () => ({
    ...React,
    useRef<T>(initialValue: T) {
        if (!hookRef) {
            hookRef = { current: initialValue };
        }

        return hookRef as Ref<T>;
    },
}));

const { useStableArray } = await import("../src/hooks/use-stable-array");

const compareById = (a: Item, b: Item) => a.id === b.id;

beforeEach(() => {
    hookRef = undefined;
});

afterAll(() => {
    mock.module("react", () => React);
});

describe("useStableArray", () => {
    test("returns the initial array reference", () => {
        const initial = [{ id: 1 }];

        expect(useStableArray(initial, compareById)).toBe(initial);
    });

    test("keeps the previous reference when array contents are equivalent", () => {
        const initial = [{ id: 1 }, { id: 2 }];
        const equivalent = [{ id: 1 }, { id: 2 }];

        useStableArray(initial, compareById);
        const stable = useStableArray(equivalent, compareById);

        expect(stable).toBe(initial);
        expect(stable).not.toBe(equivalent);
    });

    test("adopts the next reference when an item changes", () => {
        const initial = [{ id: 1 }, { id: 2 }];
        const changed = [{ id: 1 }, { id: 3 }];

        useStableArray(initial, compareById);

        expect(useStableArray(changed, compareById)).toBe(changed);
    });

    test("adopts the next reference when the length changes", () => {
        const initial = [{ id: 1 }];
        const longer = [{ id: 1 }, { id: 2 }];

        useStableArray(initial, compareById);

        expect(useStableArray(longer, compareById)).toBe(longer);
    });

    test("does not compare items when the array reference is unchanged", () => {
        const initial = [{ id: 1 }];
        const isEqual = mock(compareById);

        useStableArray(initial, isEqual);
        useStableArray(initial, isEqual);

        expect(isEqual).not.toHaveBeenCalled();
    });
});
