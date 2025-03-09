#!/usr/bin/env bash

# The ratio between the width : height of the end-rendering font
FONT_RATIO=".44"
VIDEO_FORMATS=("mp4" "mkv")
OUTPUT_FPS=24
OUTPUT_COLUMNS=100

# Colors Used
BLUE="0,0,230"
BLUE_DISTANCE_TOLERANCE=90
BLUE_MIN_LUMINANCE=10
BLUE_MAX_LUMINANCE=21

WHITE="215,215,215"
WHITE_DISTANCE_TOLERANCE=140
WHITE_MIN_LUMINANCE="165"
WHITE_MAX_LUMINANCE="255"

#
# Outputs the distance between two colors to stdout
#
# @param $1: r,g,b color #1
# @param $2: r,g,b color #2
#
color_distance_from() {
  awk -v c1="$1" -v c2="$2" '
    BEGIN {
      split(c1, a, ",");
      split(c2, b, ",");
      print abs(a[1] - b[1]) + abs(a[2] - b[2]) + abs(a[3] - b[3]);
    }
    function abs(x) { return ((x < 0) ? -x : x) }
  '
}

#
# Outputs the calculated pixel for the color to stdout
#
# @param $1: The r,g,b Pixel
#
pixel_for() {
  printf "." >&2
  local r="$(echo "$1" | cut -f1 -d ',')"
  local g="$(echo "$1" | cut -f2 -d ',')"
  local b="$(echo "$1" | cut -f3 -d ',')"

  # https://en.wikipedia.org/wiki/Relative_luminance
  # Relative luminance scaled from 0-9
  # We'll use this to determine the Pixel to render, (. o x X E H), etc.
  # TODO: I might want to grab a _very specific_ slice of luminance (e.g from 200 -> 220)
  # TODO: Only call this if it hits a pixel
  #local scaled_luminance="$(echo "(0.2126 * $r + 0.7152 * $g + 0.0722 * $b) * 9 / 255" | bc)"
  local luminance=$(awk -v r="$r" -v g="$g" -v b="$b" 'BEGIN{print int((0.2126 * r + 0.7152 * g + 0.0722 * b) / 1)}')

  local blue_distance="$(color_distance_from "$BLUE" "$1")"
  local white_distance="$(color_distance_from "$WHITE" "$1")"

  if [[ $blue_distance -lt $BLUE_DISTANCE_TOLERANCE ]]; then
    local scaled_luminance=$(awk -v luminance="$luminance" -v min="$BLUE_MIN_LUMINANCE" -v max="$BLUE_MAX_LUMINANCE" 'BEGIN{print int((luminance - min) * 9 / (max - min))}')
    echo "B$scaled_luminance"
  elif [[ $white_distance -lt $WHITE_DISTANCE_TOLERANCE ]]; then
    local scaled_luminance=$(awk -v luminance="$luminance" -v min="$WHITE_MIN_LUMINANCE" -v max="$WHITE_MAX_LUMINANCE" 'BEGIN{print int((luminance - min) * 9 / (max - min))}')
    echo "W$scaled_luminance"
  else
    echo " "
  fi
}

#
# @param $1: The video file
# @param $2: The directory to place the frame images
#
generate_frame_images() {
  local video_file="$1"
  local working_dir="$2"

  local frame_images_dir="$working_dir/frame_images"
  mkdir "$frame_images_dir"

  # Outputs a png file for each frame
  ffmpeg \
    -loglevel error \
    -i "$video_file" \
    -vf "scale=$OUTPUT_COLUMNS:-2,fps=$OUTPUT_FPS" \
    "$frame_images_dir/frame_%04d.png"

  for f in $(find "$frame_images_dir" -name '*.png' | sort); do
    # We need to squish the image, as the terminal "pixels" will not be 1:1,
    local squished_image_file="$(echo "$f" | sed 's/\.png$/_squished\.png/g')"
    local image_height="$(magick identify -ping -format '%h' "$f")"
    local new_height=$(echo "$FONT_RATIO * $image_height" | awk '{print int($1 + 0.9999999999999999)}')

    magick "$f" -resize "x$new_height"'!' "$squished_image_file"
    rm "$f"
    mv "$squished_image_file" "$f"

    # Generate a parsable .txt file for each frame
    local imagemagick_text_file="$(echo "$f" | sed 's/\.png$/_im\.txt/g')"
    local output_text_file="$(echo "$f" | sed 's/\.png$/\.txt/g')"
    magick "$f" "$imagemagick_text_file"
    cat "$imagemagick_text_file" | tail -n +2 | while read line; do
      # Read / parse each line
      local xy="$(echo "$line" | cut -f1 -d ' ' | sed 's/://g')"
      local column=$(echo "$xy" | sed 's/\,.*//g')
      local row=$(echo "$xy" | sed 's/.*\,//g')

      # Echo out a new line on each new row
      if [[ "$column" = "0" ]] && [[ "$row" != "0" ]]; then
        echo "" >> "$output_text_file"
      fi

      local rgb="$(echo "$line" | cut -f2 -d ' ' | cut -d "(" -f 2 | cut -d ")" -f1)"
      local pixel="$(pixel_for "$rgb")"
      echo -n "$pixel" >> "$output_text_file"
    done

    cat "$output_text_file" \
      | perl -pe 's/(B[0-9](?:B[0-9])*)/<span class="b">\1<\/span>/g' \
      | sed 's/B//g' \
      | sed 's/W//g' \
      | sed 's/0/·/g' \
      | sed 's/1/~/g' \
      | sed 's/2/o/g' \
      | sed 's/3/x/g' \
      | sed 's/4/+/g' \
      | sed 's/5/=/g' \
      | sed 's/6/*/g' \
      | sed 's/7/%/g' \
      | sed 's/8/$/g' \
      | sed 's/9/@/g' \
      > "$output_text_file.tmp"
    mv "$output_text_file.tmp" "$output_text_file"
    rm "$imagemagick_text_file"
    echo "Processed $f"
    rm "$f"
    sleep 1 # Make it easy to cancel at this breakpoint for testing
  done
}

#
# @param $1: The video file
#
video_to_terminal() {
  local video_file="$1"
  if [[ ! -f "$video_file" ]]; then
    >&2 echo "Input file '$1' does not exist"
    return 1
  fi

  local file_extension="$(echo "${video_file##*.}" | awk '{print tolower($0)}')"
  if [[ "$(echo ${VIDEO_FORMATS[@]} | grep -ow "$file_extension")" == "" ]]; then
    >&2 echo "Does not support '$file_extension' files. Use one of: ${VIDEO_FORMATS[@]}"
  fi

  local working_dir="./$(uuidgen)"
  mkdir "$working_dir"

  generate_frame_images "$video_file" "$working_dir"
}

video_to_terminal "$1"
