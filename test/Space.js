/* eslint-env node, mocha */

import { assert } from "chai";
import { Dimensions } from "../src/Dimensions.js";
import { Rect } from "../src/Rect.js";
import { Space } from "../src/Space.js";

describe("Space", () => {

  const layout = {
    minr: new Dimensions(5, 5),
    spaces: [],
    add_space: function(s) {
      //console.debug("add_space", s.toString());
      this.spaces.push(s);
    }
  };

  beforeEach(() => {
    Space.next_space = 0;
    layout.spaces = [];
  });

  it("construct", () => {
    const a = new Space(layout, 1, 2, 3, 4);
    //assert.equal(a.id, Space.next_space - 1);
    assert.equal(a.overlaps.length, 0);
    assert(!a.lock);
  });

  it("fits", () => {
    const a = new Space(layout, 0, 0, 100, 100);
    let f = a.fits(new Dimensions(60, 60));
    assert(f instanceof Dimensions);
    assert.equal(f.geometry, "40x40");

    f = a.fits(new Dimensions(500, 500));
    assert(!f);

    f = a.fits(new Dimensions(102, 102));
    assert(f instanceof Dimensions);
    assert.equal(f.area, -4);
  });

  const check_overlaps = exp => {
    assert.equal(layout.spaces.length, exp.length);
    const i = 0;
    for (let i = 0; i < layout.spaces.length; i++) {
      //console.log("Check", i);
      const want = exp[i];
      const saw  = layout.spaces[i];
      assert(saw.id.endsWith(want.id));
      assert.equal(saw.x, want.x);
      assert.equal(saw.y, want.y);
      assert.equal(saw.w, want.w);
      assert.equal(saw.h, want.h);
      assert.equal(saw.overlaps.length, want.overlaps.length);
      for (const j of want.overlaps) {
        //console.log(saw.overlaps.map(e => e.id).join(","));
        assert(saw.overlaps.find(sp => sp.id.endsWith(j)), j);
      }
    }
  };

  it("place TL", () => {
    const s = new Space(layout, 0, 0, 10, 10);
    const area = new Dimensions(3, 4);
    s.place(area, "TL");

    assert.equal(s.lock, area);
    assert.equal(s.geometry, "3x4");
    check_overlaps([
      { id: "TLXL", x: 3, y: 0, w:7, h:10, overlaps: ["TLXS", "TLYL", "TLC"] },
      { id: "TLYL", x: 0, y: 4, w: 10, h: 6, overlaps: ["TLXL","TLYS","TLC"] },
      { id: "TLXS", x: 3, y: 0, w: 7, h: 4, overlaps: ["TLXL"] },
      { id: "TLYS", x: 0, y: 4, w: 3, h: 6, overlaps: ["TLYL"] },
      { id: "TLC", x: 3, y: 4, w: 7, h: 6, overlaps: ["TLXL", "TLYL"] }
    ]);
  });

  it("place TL no YL", () => {
    const s = new Space(layout, 0, 0, 10, 10);
    const area = new Dimensions(5, 9);
    s.place(area, "TL");

    assert.equal(s.lock, area);
    assert.equal(s.geometry, "5x10");
    check_overlaps([
      { id: "TLXL", x: 5, y: 0, w:5, h:10, overlaps: [] }
    ]);
  });

  it("place TL no XL", () => {
    const s = new Space(layout, 0, 0, 10, 10);
    const area = new Dimensions(10, 5);
    s.place(area, "TL");

    assert.equal(s.lock, area);
    assert.equal(s.geometry, "10x5");
    check_overlaps([
      { id: "TLYL", x: 0, y: 5, w: 10, h: 5, overlaps: [] }
    ]);
  });

  it("place TL no XL no YL", () => {
    const s = new Space(layout, 0, 0, 10, 10);
    const area = new Dimensions(9, 9);
    s.place(area, "TL");

    assert.equal(s.lock, area);
    assert.equal(s.geometry, "10x10");
    check_overlaps([]);
  });

  it("place TR", () => {
    const s = new Space(layout, 0, 0, 10, 10);
    const area = new Dimensions(3, 4);
    s.place(area, "TR");

    assert.equal(s.lock, area);
    assert.equal(s.geometry, "3x4+7+0");
    check_overlaps([
      { id: "TRXL", x: 0, y: 0, w: 7, h: 10, overlaps: ["TRC","TRYL","TRXS"] },
      { id: "TRYL", x: 0, y: 4, w: 10, h: 6, overlaps: ["TRC","TRYS","TRXL"] },
      { id: "TRXS", x: 0, y: 0, w: 7, h: 4, overlaps: ["TRXL"] },
      { id: "TRYS", x: 7, y: 4, w: 3, h: 6, overlaps: ["TRYL"] },
      { id: "TRC", x: 0, y: 4, w: 7, h: 6, overlaps: ["TRXL", "TRYL"] }
    ]);
  });

  it("place BL", () => {
    const s = new Space(layout, 0, 0, 10, 10);
    const area = new Dimensions(3, 4);
    s.place(area, "BL");

    assert.equal(s.lock, area);
    assert.equal(s.geometry, "3x4+0+6");
    check_overlaps([
      { id: "BLXL", x: 3, y: 0, w: 7, h: 10, overlaps: ["BLC","BLYL","BLXS"] },
      { id: "BLYL", x: 0, y: 0, w: 10, h: 6, overlaps: ["BLXL","BLYS","BLC"] },
      { id: "BLXS", x: 3, y: 6, w: 7, h: 4, overlaps: ["BLXL"] },
      { id: "BLYS", x: 0, y: 0, w: 3, h: 6, overlaps: ["BLYL"] },
      { id: "BLC", x: 3, y: 0, w: 7, h: 6, overlaps: ["BLXL", "BLYL"] }
    ]);

    console.log(s.toString());
  });

  it("place BR", () => {
    const s = new Space(layout, 0, 0, 10, 10);
    const area = new Dimensions(3, 4);
    s.place(area, "BR");

    assert.equal(s.lock, area);
    assert.equal(s.geometry, "3x4+7+6");
    check_overlaps([
      { id: "BRXL", x: 0, y: 0, w: 7, h: 10, overlaps: ["BRXS","BRC","BRYL"] },
      { id: "BRYL", x: 0, y: 0, w: 10, h: 6, overlaps: ["BRXL","BRC","BRYS"] },
      { id: "BRXS", x: 0, y: 6, w: 7, h: 4, overlaps: ["BRXL"] },
      { id: "BRYS", x: 7, y: 0, w: 3, h: 6, overlaps: ["BRYL"] },
      { id: "BRC", x: 0, y: 0, w: 7, h: 6, overlaps: ["BRXL", "BRYL"] }
    ]);
  });
});
