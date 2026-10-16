import { assert } from "chai";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { FF } from "../src/FF.js";

describe("FF", () => {

  const testf = `${__dirname}/test.jpg`,
        scalef = `${__dirname}/_scale.png`,
        blankf = `${__dirname}/_blank.png`,
        mergef = `${__dirname}/_merge.png`;
  
  it("ffprobe", () => {
    return FF.probe(testf)
    .then(d => {
      assert.equal(d.streams.length, 1);
      assert.equal(d.streams.length, 1);
      const im = d.streams[0];
      assert.equal(im.width, 1280);
      assert.equal(im.height, 1024);
      //console.log(d);
    });
  });
  
  it("scales", () => {
    return FF.mpeg([
      "-i", testf,
      "-vf", "scale=960:540",
      scalef])
    .then(() => FF.probe(scalef))
    .then(d => {
      assert.equal(d.streams[0].width, 960);
      assert.equal(d.streams[0].height, 540);
    });
  });

  it("makes blank", () => {
    return FF.mpeg([
      "-f", "lavfi",
      "-i", "color=c=black:s=1920x1080",
      "-frames:v", 1,
      blankf ])
    .then(() => FF.probe(blankf))
    .then(d => {
      assert.equal(d.streams[0].width, 1920);
      assert.equal(d.streams[0].height, 1080);
    });
  });

  // If this fails, check you aren't using npx mocha --parallel
  it("combines", () => {
    return FF.mpeg([
      "-i", blankf,
      "-i", scalef,
      "-filter_complex", "overlay=x=960:y=540",
      "-frames:v", 1,
      mergef
    ]);
  });
});
