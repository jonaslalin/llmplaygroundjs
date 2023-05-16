import { expect, test } from "@jest/globals";
import { sum } from "../src/sum.js";

test("two plus two is four", () => {
    expect(sum(2, 2)).toBe(4);
});
