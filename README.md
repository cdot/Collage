# Collage
Create screen background images by compositing a number of variable-sized smaller images to minimise empty space i.e. given a fixed-size target area create composite images by combining smaller images without overlapping.

## Usage

Given a directory if images "srcdir" and a target directory "destdir",


## Algorithm

The algorithm used is derived from Richard E. Korf's paper: Optimal Rectangle Packing: Initial Results with modifications to permit overlapping candidate areas to make better use of the variable aspect ratios of input images.

Given a set of input Images, and a set of target Layouts, determine if the image fits into an available space on one of the Layouts and if not, create a new Layout.

Each Layout has a set of free Space objects representing available spaces. Each free Space defines a rectangular area, and a set of other free spaces that it overlaps. When an image is locked into a free Space it becomes a locked Space and all overlapping free Spaces are deleted. Any unused area of the original space is added to the Layout.

When it is looking for a free space for an image, all available free spaces are examined. The best free space to use for an image is determined by a cost function which compares two areas to determine which the image fits best in. Two cost functions are available:
* AREA - the cost is the total of the wasted area
* AXIS - the cost is the minimum of the waste along the X or Y axis

The code is Javascript written for node.js 19.3.0 using (http://www.graphicsmagick.org/)[GraphicsMagick] for image operations.

