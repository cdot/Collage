import stream from "stream";
import JSONStream from "JSONStream";
import bl from 'bl';
import { spawn } from "child_process";

/**
 * Interface to command-line ffprobe and ffmpeg
 * `ffprobe` and `ffmpeg` must be on the path.
 */
export class FF {

  /**
   * Call out to ffprobe a media file.
   * @param {string} filePath path to the file to inspect
   * @return {Promise} a promise that resolves to the result of the query.
   * The result is exactly what `ffprobe -show_streams` will return, in a
   * data structure. Inspect it to find what you want.
   */
  static probe(filePath) {
    const params = [ '-show_streams', '-print_format', 'json', filePath ];
    const proces = spawn("ffprobe", params);
    let info, stderr;

    return new Promise((resolve, reject) => {
      proces.once('close', code => {
        if (!code) {
          resolve(info);
        } else {
          const err = stderr.split('\n').filter(Boolean).pop();
          reject(new Error(err));
        }
      });

      proces.stderr.pipe(new bl((err, data) => stderr = data.toString()));

      proces.stdout
      .pipe(JSONStream.parse())
      .once('data', data => info = data);
    });
  }

  /**
   * Call out to ffmpeg.
   * @param {[]} params list of parameters to ffmpeg
   * @return {Promise} a promise that resolves to undefined
   */
  static mpeg(params) {
    params.unshift("-y");
    const proces = spawn("ffmpeg", params);
    let info, stderr;

    return new Promise((resolve, reject) => {
      proces.once('close', code => {
        if (!code) {
          resolve(info);
        } else {
          const err = stderr.split('\n').filter(Boolean).pop();
          reject(new Error(err));
        }
      });

      proces.stderr.pipe(new bl((err, data) => stderr = data.toString()));

      proces.stdout
      .pipe(JSONStream.parse())
      .once('data', data => info = data);
    })
    .catch(e => {
      console.log(e, "Parameters:", params);
    });
  }
}
