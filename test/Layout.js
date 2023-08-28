/* eslint-env node, mocha */

import { assert } from "chai";
import { Dimensions } from "../src/Dimensions.js";
import { Rect } from "../src/Rect.js";
import { Space } from "../src/Space.js";
import { Layout } from "../src/Layout.js";

function UNit() {}

describe("Layout", () => {

  it("construct", () => {
    const l = new Layout(new Dimensions(10, 10), new Dimensions(2,2));
    assert.equal(l.id, Layout.next_layout - 1);
    assert.equal(l.minr.w, 2);
    assert.equal(l.minr.h, 2);
    assert(l.spaces.length === 1);
    const s = l.spaces[0];
    assert.equal(s.w, 10);
    assert.equal(s.h, 10);
    assert.equal(s.layout, l);
  });

  it("add/remove space", () => {
    const l = new Layout(new Dimensions(10, 10), new Dimensions(2,2));
    const s1 = new Space(l, 1, 1, 3, 3, "test1");
    l.add_space(s1);
    assert.equal(l.spaces.length, 2);
    const s2 = new Space(l, 3, 3, 3, 3, "test2");
    l.add_space(s2);
    assert.equal(l.spaces.length, 3);
    l.remove_space(s1);
    assert.equal(l.spaces.length, 2);
  });

  it("simplify - simple", () => {
    const l = new Layout(new Dimensions(10, 10), new Dimensions(2,2));
    l.remove_space(l.spaces[0]);
    // +-----+-----+
    // |     |     |
    // |     |     |
    // +-----+-----+
    // |     |     |
    // |     |     |
    // +-----+-----+   
    const tl = new Space(l, 0, 0, 5, 5, "TL");
    l.add_space(tl);
    const tr = new Space(l, 5, 0, 5, 5, "TR");
    l.add_space(tr);
    const bl = new Space(l, 0, 5, 5, 5, "BL");
    l.add_space(bl);
    const br = new Space(l, 5, 5, 5, 5, "BR");
    l.add_space(br);
    assert.equal(l.spaces.length, 4);
    l.simplify();
    assert.equal(l.spaces.length, 1);
    const res = l.spaces[0];
    assert.equal(res.x, 0);
    assert.equal(res.y, 0);
    assert.equal(res.w, 10);
    assert.equal(res.h, 10);
  });

  it("simplify - mid horizontal", () => {
    const l = new Layout(new Dimensions(10, 15), new Dimensions(2,2));
    l.remove_space(l.spaces[0]);
    // +-----+-----+
    // |     |     |
    // | tl  |  tr |
    // +-----+-----+
    // |           |
    // |   mid     |
    // +-----+-----+
    // |     |     |
    // | bl  | br  |
    // +-----+-----+   
    const tl = new Space(l, 0, 0, 5, 5, "TL");
    l.add_space(tl);
    const tr = new Space(l, 5, 0, 5, 5, "TR");
    l.add_space(tr);
    const mid = new Space(l, 0, 5, 10, 5, "MID");
    l.add_space(mid);
    mid.lock = true;
    const bl = new Space(l, 0, 10, 5, 5, "BL");
    l.add_space(bl);
    const br = new Space(l, 5, 10, 5, 5, "BR");
    l.add_space(br);
    assert.equal(l.spaces.length, 5);
    l.simplify();
    assert.equal(l.spaces.length, 1);
    const res = l.spaces[0];
    assert.equal(res.x, 0);
    assert.equal(res.y, 0);
    assert.equal(res.w, 10);
    assert.equal(res.h, 15);
  });

  it("simplify - mid vertical", () => {
    const l = new Layout(new Dimensions(15, 10), new Dimensions(2,2));
    l.remove_space(l.spaces[0]);
    // +-----+------+----+
    // |     |      |    |
    // | tl  |  mid | tr |
    // +-----+      +----+
    // |     |      |    |
    // | bl  |      | br |
    // +-----+------+----+
    // tl and bl should merge
    const tl = new Space(l, 0, 0, 5, 5, "TL");
    l.add_space(tl);
    const tr = new Space(l, 10, 0, 5, 5, "TR");
    l.add_space(tr);
    const mid = new Space(l, 5, 0, 5, 10, "MID");
    l.add_space(mid);
    mid.lock = true;
    const bl = new Space(l, 0, 5, 5, 5, "BL");
    l.add_space(bl);
    const br = new Space(l, 10, 5, 5, 5, "BR");
    l.add_space(br);
    assert.equal(l.spaces.length, 5);
    l.simplify();
    assert.equal(l.spaces.length, 1);
    const res = l.spaces[0];
    assert.equal(res.x, 0);
    assert.equal(res.y, 0);
    assert.equal(res.w, 15);
    assert.equal(res.h, 10);
  });
});
