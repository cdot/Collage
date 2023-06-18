# Collage
The goal is to create screen background images by compositing a number of variable-sized smaller images to minimise empty space i.e.
given a fixed-size target area create composite images by combining smaller images without overlapping.

The algorithm used is derived from Richard E. Korf's paper: Optimal Rectangle Packing: Initial Results with modifications to permit overlapping candidate areas to make better use of the variable aspect ratios of input images.

The code is Javascript written for node.js 19.3.0
