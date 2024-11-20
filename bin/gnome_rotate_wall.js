/*Copyright (C) 2023 Crawford Currie https://github.com/cdot
  License MIT. See README.md at the root of this distribution for full copyright
  and license information.*/

/**
 * Create a rotating wallpapers control file for gsettings.
 * Scans a nominated directory (and optionally subdirectories) for images.
 * ```
 * $ gsettings list-recursively org.gnome.desktop.background
 * ```
 * gets a list of available settings.
 * ```
 * $ /usr/bin/gsettings set org.gnome.desktop.background picture-uri file:///home/user/test.x
ml
 * ```
 * sets an XML control file.
 * See https://github.com/GNOME/gsettings-desktop-schemas/blob/master/schemas/org.gnome.desktop.background.gschema.xml.in
 */
import getopt from "posix-getopt";
import path from "path";
import { promises as Fs } from "fs";
import { Images } from "../src/Images.js";
import child_process from "child_process";

let debug = false;
let help = false;
let install = false;
let recurse = true;
let backgrounds = `${process.env.HOME}/Pictures/Backgrounds`;
let xml_file = `${process.env.HOME}/.config/rotate_wallpapers.xml`;
let transition_time = 15;
let freeze_time = 300;

const DESCRIPTION = [
  "Rotate wallpapers on a rolling schedule\n",
  "USAGE",
  `\tnode ${path.relative(".", process.argv[1])} [options]`,
  "\nOPTIONS",
  "\t-b, --backgrounds <dir> - Path to directory where images are stored",
  `\t\t(default ${backgrounds})`,
  "\t-d, --debug - enable debug trace",
  "\t-f, --freeze <t> Set time to freeze background (seconds)",
  `\t\t(default ${freeze_time})`,
  "\t-h, --help - Print this help",
  "\t-i, --install - use gsettings to install the control file",
  "\t-r, --recurse - scan subdirectories of backgrounds dir (default)",
  "\t-R, --norecurse - do not recurse",
  "\t-t, --transition <t> - Set transition animation time (seconds)",
  `\t\t(default ${transition_time})`,
  "\t-x, --xml <file> - Absolute path to the XML control file",
  `\t\t(default ${xml_file})`,
];

function usage(mess) {
  if (mess) console.error(`*** ${mess}`);
  console.error(DESCRIPTION.join("\n"));
  process.exit();
}

/**
 * Promisify child_process.exec
 * @return {Promise} promise that resolves to stdout or rejects with
 * error.
 */
function exec(command) {
  return new Promise((resolve, reject) => {
    child_process.exec(
      command,
      (error, stdout, stderr) => {
        if (stderr) console.error(stderr);
        if (error)
          reject(error);
        else
          resolve(stdout);
      });
  });
}

const go_parser = new getopt.BasicParser(
  "d(debug)h(help)i(install)b:(backgrounds)r:(recurse)R:(norecurse)x:(xml)t:(transition)f:(freeze)",
  process.argv);

let option;
console.debug = () => {};
while ((option = go_parser.getopt())) {
  switch (option.option) {
  default: usage(`Unsupported option ${option.option}`);
  case "d": console.debug = console.log; break;
  case "h": usage();
  case 'i': install = true; break;
  case "r": recurse = true; break;
  case "R": recurse = true; break;
  case "x": xml_file = option.optarg; break;
  case "t":
    try {
      transition_time = parseInt(option.optarg);
    } catch (e) {
      usage(`Bad transition "${option.optarg}"`);
    }
    break;
  case "b":
	  backgrounds = option.optarg;
    break;
  case "f":
    try {
      freeze_time = parseInt(option.optarg);
    } catch (e) {
      usage(`Bad freeze time "${option.optarg}"`);
    }
    break;
  }
}

const t = new Date();
const GSET = "gsettings set org.gnome.desktop.background";
const images = new Images();

images.get_images(backgrounds, !recurse)
.then(() => {
  console.debug(`${images.length} images found`);
  images.shuffle();

  const xml = [
    "<background>",
    "  <starttime>",
    `    <year>${t.getFullYear()}</year>`,
    `    <month>${t.getMonth()}</month>`,
    `    <day>${t.getDate()}</day>`,
    `    <hour>${t.getHours()}</hour>`,
    `    <minute>${t.getMinutes()}</minute>`,
    `    <second>${t.getSeconds()}</second>`,
    "  </starttime>"];
  let first, last, image;
  for (image of images) {
    if (!first) first = image.path;
    if (last) {
      xml.push("  <transition>",
                   `   <duration>${transition_time}</duration>`,
                   `   <from>${last}</from>`,
                   `   <to>${image.path}</to>`,
                   "  </transition>");
    }
    xml.push("  <static>",
                 `    <duration>${freeze_time}</duration>`,
                 `    <file>${image.path}</file>`,
                 "  </static>");
    last = image.path;
  }

  if (last && first) {
    xml.push("  <transition>",
                 `   <duration>${transition_time}</duration>`,
                 `   <from>${last}</from>`,
                 `   <to>${first}</to>`,
                 "  </transition>");
  }
  xml.push("</background>");

  return Fs.writeFile(xml_file, xml.join("\n"));
})
.then(() => {
  console.debug(`${xml_file} generated`);
  if (install) {
    return exec(`${GSET} picture-uri ""`)
    //.then(stdout => console.debug(stdout))
    .then(() => exec(`${GSET} picture-options 'scaled'`))
    //.then(stdout => console.debug(stdout))
    .then(() => exec(`${GSET} picture-uri file://${xml_file}`))
    //.then(stdout => console.debug(stdout))
    .then(() => console.debug("gsettings updated"));
  }
});

