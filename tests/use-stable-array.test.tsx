import { afterEach, describe, expect, mock, test } from "bun:test";
import {
    cleanup,
    renderHook,
} from "@testing-library/react-native";
import { useStableArray } from "../src/hooks/use-stable-array";

interface Item {
    id: number;
}

interface HookProps {
    items: readonly Item[];
    isEqual: (a: Item, b: Item) => boolean;
}

const compareById = (a: Item, b: Item) => a.id === b.id;

afterEach(async () => {
    await cleanup();
});

describe("useStableArray", () => {
    test("returns the initial array reference", async () => {
        const initial = [{ id: 1 }];

        const { result } = await renderHook(
            ({ items, isEqual }: HookProps) =>
                useStableArray(items, isEqual),
            {
                initialProps: { items: initial, isEqual: compareById },
            },
        );

        expect(result.current).toBe(initial);
    });

    test("keeps the previous reference when array contents are equivalent", async () => {
        const initial = [{ id: 1 }, { id: 2 }];
        const equivalent = [{ id: 1 }, { id: 2 }];
        const { result, rerender } = await renderHook(
            ({ items, isEqual }: HookProps) =>
                useStableArray(items, isEqual),
            {
                initialProps: { items: initial, isEqual: compareById },
            },
        );

        await rerender({ items: equivalent, isEqual: compareById });

        expect(result.current).toBe(initial);
        expect(result.current).not.toBe(equivalent);
    });

    test("adopts the next reference when an item changes", async () => {
        const initial = [{ id: 1 }, { id: 2 }];
        const changed = [{ id: 1 }, { id: 3 }];
        const { result, rerender } = await renderHook(
            ({ items, isEqual }: HookProps) =>
                useStableArray(items, isEqual),
            {
                initialProps: { items: initial, isEqual: compareById },
            },
        );

        await rerender({ items: changed, isEqual: compareById });

        expect(result.current).toBe(changed);
    });

    test("adopts the next reference when the length changes", async () => {
        const initial = [{ id: 1 }];
        const longer = [{ id: 1 }, { id: 2 }];
        const { result, rerender } = await renderHook(
            ({ items, isEqual }: HookProps) =>
                useStableArray(items, isEqual),
            {
                initialProps: { items: initial, isEqual: compareById },
            },
        );

        await rerender({ items: longer, isEqual: compareById });

        expect(result.current).toBe(longer);
    });

    test("does not compare items when the array reference is unchanged", async () => {
        const initial = [{ id: 1 }];
        const isEqual = mock(compareById);
        const { rerender } = await renderHook(
            ({ items, isEqual }: HookProps) =>
                useStableArray(items, isEqual),
            {
                initialProps: { items: initial, isEqual },
            },
        );

        await rerender({ items: initial, isEqual });

        expect(isEqual).not.toHaveBeenCalled();
    });
});
