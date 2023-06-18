import getopt from "posix-getopt";
import path from "path";

import { Rect } from "../src/Rect.js";
import { Images } from "../src/Images.js";
import { Collage } from "../src/Collage.js";

const DESCRIPTION = [
  "USAGE",
  `\tnode ${path.relative(".", process.argv[1])} [options] <in> <out>`,
  "\nPARAMETERS",
  "<in> - path to directory containing input images, scanned recursively",
  "<out> - path to output directory",
  "\nOPTIONS",
  "\t-a, --area - size of the output areas, default is 1920x1080",
  "\t-o, --overlap - maximum allowable image overlap, default is 20x20",
  "\t-c, --cost - cost function, one of AXIS or AREA",
  "\nDESCRIPTION",
  "\tCreate images by compositing a number of variable-sized smaller images",
  "\tto minimise empty space"
];

const go_parser = new getopt.BasicParser(
  "a:(area)d:(debug)c:(cost)o:(overlap)", process.argv);

const area = new Rect(1920, 1080);
const overlap = new Rect(20, 20);

function usage(mess) {
  console.error(`*** ${mess}`);
  console.error(DESCRIPTION.join("\n"));
  process.exit();
}

const options = {};
let option, wh, cost_function = "AXIS";
console.debug = () => {};
while ((option = go_parser.getopt())) {
  switch (option.option) {
  default: usage(`Unsupported option ${option.option}`);
  case 'd':
    console.debug = console.log;
    break;
  case 'a':
    if (!/^\d+x\d+$/i.test(option.optarg))
      usage(`Bad area "${option.optarg}"`);
    wh = option.optarg.split(/x/i);
    area.w = wh[0];
    area.h = wh[1];
    break;
  case 'o':
    if (!/^\d+x\d+$/i.test(option.optarg))
      usage(`Bad overlap "${option.optarg}"`);
    wh = option.optarg.split(/x/i);
    overlap.w = wh[0];
    overlap.h = wh[1];
    break;
  case 'c':
    cost_function = option.optarg;
    if (!/^(AXIS|AREA)$/.test(cost_function))
      usage(`Bad cost function "${cost_function}"`);
    break;
  }
}

if (process.argv.length - go_parser.optind() !== 2)
	usage('Bad arguments');

const dest = process.argv[go_parser.optind()];
const src = process.argv[go_parser.optind() + 1];

let images = new Images();
images.get_images(src)
.then(() => images.sort_by_area())
.then(() => {
  let coll = new Collage(area, overlap, images);
  coll.plan_layouts(cost_function);
  return coll.compose_layouts(dest);
});

