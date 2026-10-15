import { assert } from "chai";
import { FF } from "../src/FF.js";

describe("FF", () => {

  it("ffprobe", () => {
    return FF.probe("./test.jpg")
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
      "-i", "./test.jpg",
      "-vf", "scale=960:540",
      "./temporary.png"])
    .then(() => FF.probe("./temporary.png"))
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
      "./blank.png" ])
    .then(() => FF.probe("./blank.png"))
    .then(d => {
      assert.equal(d.streams[0].width, 1920);
      assert.equal(d.streams[0].height, 1080);
    });
  });

  // If this fails, check you aren't using npx mocha --parallel
  it("combines", () => {
    return FF.mpeg([
      "-i", "blank.png",
      "-i", "temporary.png",
      "-filter_complex", "overlay=x=960:y=540",
      "-frames:v", 1,
      "combined.png"
    ]);
  });
});
