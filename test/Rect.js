/* eslint-env node, mocha */

import { assert } from "chai";
import { Dimensions } from "../src/Dimensions.js";
import { Rect } from "../src/Rect.js";

describe("Rect", () => {

  it("construct nums", () => {
    const r = new Rect(1, 2, 3, 4);
    assert.equal(r.x, 1);
    assert.equal(r.y, 2);
    assert.equal(r.w, 3);
    assert.equal(r.h, 4);
  });

  it("construct other", () => {
    const r = new Rect(new Rect(1, 2, 3, 4));
    assert.equal(r.x, 1);
    assert.equal(r.y, 2);
    assert.equal(r.w, 3);
    assert.equal(r.h, 4);
  });

  it("construct dim", () => {
    const r = new Rect(3, 4);
    assert.equal(r.x, 0);
    assert.equal(r.y, 0);
    assert.equal(r.w, 3);
    assert.equal(r.h, 4);
  });

  it("construct other dim", () => {
    const r = new Rect(1, 2, new Rect(3, 4));
    assert.equal(r.x, 1);
    assert.equal(r.y, 2);
    assert.equal(r.w, 3);
    assert.equal(r.h, 4);
  });

  it("geometry", () => {
    let r = new Rect(1, 2, 3, 4);
    assert.equal(r.geometry, "3x4+1+2");
    r = new Rect(5, 6);
    assert.equal(r.geometry, "5x6");
  });

  it("area", () => {
    let r = new Rect(1, 2, 3, 4);
    assert.equal(r.area, 3 * 4);
  });
  
  it("aspect_ratio", () => {
    let r = new Rect(1, 2, 3, 4);
    assert.equal(r.aspect_ratio, 3 / 4);
  });

  it("fit_into", () => {
    let a = new Rect(0, 0, 100, 200);
    let b = new Rect(10, 20, 200, 100);
    let f = b.fit_into(a);
    assert(f instanceof Dimensions);
    assert.equal(f.geometry, "100x50");
    assert.equal(b.aspect_ratio, f.aspect_ratio);

    f = a.fit_into(b);
    assert.equal(f.geometry, "50x100");
    assert.equal(a.aspect_ratio, f.aspect_ratio);

    f = a.fit_into(a);
    assert(f === a);

    f = new Rect(0, 0, 100, 200).fit_into(a);
    assert.equal(f.geometry, "100x200");
  });

  it("contains", () => {
    let a = new Rect(0, 0, 100, 100);
    assert(a.contains(a));
    let b = new Rect(-10, -10, 120, 120);
    assert(b.contains(a));
    assert(!a.contains(b));
  });

  it("mergeable", () => {
    let centre = new Rect(100, 100, 100, 100);
    let left = new Rect(0, 100, 100, 100);
    let right = new Rect(200, 100, 100, 100);
    let top = new Rect(100, 0, 100, 100);
    let bottom = new Rect(100, 200, 100, 100);
    let wrap = new Rect(0, 0, 300, 300);
    let contained = new Rect(110, 110, 80, 80);
    assert.equal(centre.mergeable(left), "LEFT");
    assert.equal(left.mergeable(centre), "RIGHT");
    assert.equal(centre.mergeable(top), "TOP");
    assert.equal(top.mergeable(centre), "BOTTOM");
  });

  it("centre_offset", () => {
    let a = new Rect(10, 10, 100, 100);
    assert.equal(a.centre_offset(a), "+10+10");
    let b = new Rect(10, 10);
    assert.equal(a.centre_offset(b), "+55+55");
  });
});
