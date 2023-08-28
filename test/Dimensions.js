/* eslint-env node, mocha */

import { assert } from "chai";
import { Dimensions } from "../src/Dimensions.js";

describe("Dimensions", () => {

  it("construct nums", () => {
    const r = new Dimensions(3, 4);
    assert.equal(r.w, 3);
    assert.equal(r.h, 4);
  });

  it("construct other", () => {
    const r = new Dimensions(new Dimensions(3, 4));
    assert.equal(r.w, 3);
    assert.equal(r.h, 4);
  });

  it("geometry", () => {
    let r = new Dimensions(3, 4);
    assert.equal(r.geometry, "3x4");
  });

  it("area", () => {
    let r = new Dimensions(3, 4);
    assert.equal(r.area, 3 * 4);
    r = new Dimensions(-3, 4);
    assert.equal(r.area, -12);
    r = new Dimensions(3, -4);
    assert.equal(r.area, -12);
    r = new Dimensions(-3, -4);
    assert.equal(r.area, -12);
  });
  
  it("aspect_ratio", () => {
    let r = new Dimensions(3, 4);
    assert.equal(r.aspect_ratio, 3 / 4);
  });

  it("fit_into", () => {
    let a = new Dimensions(100, 200);
    let b = new Dimensions(200, 100);
    let f = b.fit_into(a);
    assert(f instanceof Dimensions);
    assert.equal(f.geometry, "100x50");
    assert.equal(b.aspect_ratio, f.aspect_ratio);

    f = a.fit_into(b);
    assert.equal(f.geometry, "50x100");
    assert.equal(a.aspect_ratio, f.aspect_ratio);

    f = a.fit_into(a);
    assert(f === a);

    f = new Dimensions(100, 200).fit_into(a);
    assert(f instanceof Dimensions);
  });
});
