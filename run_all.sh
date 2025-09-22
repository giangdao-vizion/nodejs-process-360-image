#!/bin/bash

start_all=$(date +%s)  # record start time for the whole script

run_job() {
  local cmd="$1"
  local label="$2"

  echo "▶️ Starting $label ..."
  start=$(date +%s)

  eval $cmd
  status=$?

  end=$(date +%s)
  runtime=$((end - start))

  if [ $status -eq 0 ]; then
    echo "✅ Finished $label in ${runtime}s"
  else
    echo "❌ Failed $label (after ${runtime}s)"
  fi
}

# Run jobs one by one
# run_job "venv/bin/python python/equito2dall.py input/19m.jpg output/T05-19m-1pn.jpg 90 300 0 19685 11418 9938 9449 4488" "T05-19m-1pn.jpg"
# run_job "venv/bin/python python/equito2dall.py input/19m.jpg output/T05-19m-2pn.jpg 90 300 0 19685 11418 11398 9449 4252" "T05-19m-2pn.jpg"
# run_job "venv/bin/python python/equito2dall.py input/19m.jpg output/T05-19m-3pn.jpg 90 300 0 18000 11418 11417 9449 12007 6890" "T05-19m-3pn.jpg"

# run_job "venv/bin/python python/equito2d.py input/19m.jpg output/T05-19m-c2900-r850.jpg 40 300 0 3346 11418" "T05-19m-c2900-r850.jpg"
# run_job "venv/bin/python python/equito2d.py input/19m.jpg output/T05-19m-c2900-r1080.jpg 45 300 0 4252 11418" "T05-19m-c2900-r1080.jpg"
# run_job "venv/bin/python python/equito2d.py input/19m.jpg output/T05-19m-c2900-r1140.jpg 50 300 0 4488 11418" "T05-19m-c2900-r1140.jpg"
# run_job "venv/bin/python python/equito2d.py input/19m.jpg output/T05-19m-c2900-r1750.jpg 60 300 0 6890 11418" "T05-19m-c2900-r1750.jpg"
# run_job "venv/bin/python python/equito2d.py input/19m.jpg output/T05-19m-c2900-r2200.jpg 70 300 0 8661 11418" "T05-19m-c2900-r2200.jpg"
# run_job "venv/bin/python python/equito2d.py input/19m.jpg output/T05-19m-c2900-r2400.jpg 80 300 0 9449 11418" "T05-19m-c2900-r2400.jpg"
# run_job "venv/bin/python python/equito2d.py input/19m.jpg output/T05-19m-c2900-r2522.jpg 90 300 0 9938 11418" "T05-19m-c2900-r2522.jpg"
# run_job "venv/bin/python python/equito2d.py input/19m.jpg output/T05-19m-c2900-r2895.jpg 90 300 0 11393 11418" "T05-19m-c2900-r2895.jpg"
# run_job "venv/bin/python python/equito2d.py input/19m.jpg output/T05-19m-c2900-r2900.jpg 90 300 0 11418 11418" "T05-19m-c2900-r2900.jpg"

# run_job "venv/bin/python python/equito2d.py input/19m.jpg output/T05-19m-c2900-r850-30.jpg 40 270 0 3346 11418" "T05-19m-c2900-r850-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/19m.jpg output/T05-19m-c2900-r1080-30.jpg 45 270 0 4252 11418" "T05-19m-c2900-r1080-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/19m.jpg output/T05-19m-c2900-r1140-30.jpg 50 270 0 4488 11418" "T05-19m-c2900-r1140-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/19m.jpg output/T05-19m-c2900-r1750-30.jpg 60 270 0 6890 11418" "T05-19m-c2900-r1750-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/19m.jpg output/T05-19m-c2900-r2200-30.jpg 70 270 0 8661 11418" "T05-19m-c2900-r2200-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/19m.jpg output/T05-19m-c2900-r2400-30.jpg 80 270 0 9449 11418" "T05-19m-c2900-r2400-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/19m.jpg output/T05-19m-c2900-r2522-30.jpg 90 270 0 9938 11418" "T05-19m-c2900-r2522-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/19m.jpg output/T05-19m-c2900-r2895-30.jpg 90 270 0 11393 11418" "T05-19m-c2900-r2895-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/19m.jpg output/T05-19m-c2900-r2900-30.jpg 90 270 0 11418 11418" "T05-19m-c2900-r2900-30.jpg"

# run_job "venv/bin/python python/equito2d.py input/19m.jpg output/T05-19m-c2900-r850-60.jpg 40 330 0 3346 11418" "T05-19m-c2900-r850-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/19m.jpg output/T05-19m-c2900-r1080-60.jpg 45 330 0 4252 11418" "T05-19m-c2900-r1080-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/19m.jpg output/T05-19m-c2900-r1140-60.jpg 50 330 0 4488 11418" "T05-19m-c2900-r1140-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/19m.jpg output/T05-19m-c2900-r1750-60.jpg 60 330 0 6890 11418" "T05-19m-c2900-r1750-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/19m.jpg output/T05-19m-c2900-r2200-60.jpg 70 330 0 8661 11418" "T05-19m-c2900-r2200-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/19m.jpg output/T05-19m-c2900-r2400-60.jpg 80 330 0 9449 11418" "T05-19m-c2900-r2400-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/19m.jpg output/T05-19m-c2900-r2522-60.jpg 90 330 0 9938 11418" "T05-19m-c2900-r2522-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/19m.jpg output/T05-19m-c2900-r2895-60.jpg 90 330 0 11393 11418" "T05-19m-c2900-r2895-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/19m.jpg output/T05-19m-c2900-r2900-60.jpg 90 330 0 11418 11418" "T05-19m-c2900-r2900-60.jpg"

# run_job "venv/bin/python python/equito2dall.py input/35m.jpg output/T10-35m-1pn.jpg 90 300 0 19685 11418 9938 9449 4488" "T10-35m-1pn.jpg"
# run_job "venv/bin/python python/equito2dall.py input/35m.jpg output/T10-35m-2pn.jpg 90 300 0 19685 11418 11398 9449 4252" "T10-35m-2pn.jpg"
# run_job "venv/bin/python python/equito2dall.py input/35m.jpg output/T10-35m-3pn.jpg 90 300 0 22000 11418 11417 9449 12007 6890" "T10-35m-3pn.jpg"

# run_job "venv/bin/python python/equito2d.py input/35m.jpg output/T10-35m-c2900-r850.jpg 40 300 0 3346 11418" "T10-35m-c2900-r850.jpg"
# run_job "venv/bin/python python/equito2d.py input/35m.jpg output/T10-35m-c2900-r1080.jpg 45 300 0 4252 11418" "T10-35m-c2900-r1080.jpg"
# run_job "venv/bin/python python/equito2d.py input/35m.jpg output/T10-35m-c2900-r1140.jpg 50 300 0 4488 11418" "T10-35m-c2900-r1140.jpg"
# run_job "venv/bin/python python/equito2d.py input/35m.jpg output/T10-35m-c2900-r1750.jpg 60 300 0 6890 11418" "T10-35m-c2900-r1750.jpg"
# run_job "venv/bin/python python/equito2d.py input/35m.jpg output/T10-35m-c2900-r2200.jpg 70 300 0 8661 11418" "T10-35m-c2900-r2200.jpg"
# run_job "venv/bin/python python/equito2d.py input/35m.jpg output/T10-35m-c2900-r2400.jpg 80 300 0 9449 11418" "T10-35m-c2900-r2400.jpg"
# run_job "venv/bin/python python/equito2d.py input/35m.jpg output/T10-35m-c2900-r2522.jpg 90 300 0 9938 11418" "T10-35m-c2900-r2522.jpg"
# run_job "venv/bin/python python/equito2d.py input/35m.jpg output/T10-35m-c2900-r2895.jpg 90 300 0 11393 11418" "T10-35m-c2900-r2895.jpg"
# run_job "venv/bin/python python/equito2d.py input/35m.jpg output/T10-35m-c2900-r2900.jpg 90 300 0 11418 11418" "T10-35m-c2900-r2900.jpg"

# run_job "venv/bin/python python/equito2d.py input/35m.jpg output/T10-35m-c2900-r850-30.jpg 40 270 0 3346 11418" "T10-35m-c2900-r850-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/35m.jpg output/T10-35m-c2900-r1080-30.jpg 45 270 0 4252 11418" "T10-35m-c2900-r1080-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/35m.jpg output/T10-35m-c2900-r1140-30.jpg 50 270 0 4488 11418" "T10-35m-c2900-r1140-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/35m.jpg output/T10-35m-c2900-r1750-30.jpg 60 270 0 6890 11418" "T10-35m-c2900-r1750-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/35m.jpg output/T10-35m-c2900-r2200-30.jpg 70 270 0 8661 11418" "T10-35m-c2900-r2200-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/35m.jpg output/T10-35m-c2900-r2400-30.jpg 80 270 0 9449 11418" "T10-35m-c2900-r2400-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/35m.jpg output/T10-35m-c2900-r2522-30.jpg 90 270 0 9938 11418" "T10-35m-c2900-r2522-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/35m.jpg output/T10-35m-c2900-r2895-30.jpg 90 270 0 11393 11418" "T10-35m-c2900-r2895-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/35m.jpg output/T10-35m-c2900-r2900-30.jpg 90 270 0 11418 11418" "T10-35m-c2900-r2900-30.jpg"

# run_job "venv/bin/python python/equito2d.py input/35m.jpg output/T10-35m-c2900-r850-60.jpg 40 330 0 3346 11418" "T10-35m-c2900-r850-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/35m.jpg output/T10-35m-c2900-r1080-60.jpg 45 330 0 4252 11418" "T10-35m-c2900-r1080-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/35m.jpg output/T10-35m-c2900-r1140-60.jpg 50 330 0 4488 11418" "T10-35m-c2900-r1140-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/35m.jpg output/T10-35m-c2900-r1750-60.jpg 60 330 0 6890 11418" "T10-35m-c2900-r1750-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/35m.jpg output/T10-35m-c2900-r2200-60.jpg 70 330 0 8661 11418" "T10-35m-c2900-r2200-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/35m.jpg output/T10-35m-c2900-r2400-60.jpg 80 330 0 9449 11418" "T10-35m-c2900-r2400-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/35m.jpg output/T10-35m-c2900-r2522-60.jpg 90 330 0 9938 11418" "T10-35m-c2900-r2522-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/35m.jpg output/T10-35m-c2900-r2895-60.jpg 90 330 0 11393 11418" "T10-35m-c2900-r2895-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/35m.jpg output/T10-35m-c2900-r2900-60.jpg 90 330 0 11418 11418" "T10-35m-c2900-r2900-60.jpg"

# run_job "venv/bin/python python/equito2dall.py input/51m.jpg output/T15-51m-1pn.jpg 90 300 0 19685 11418 9938 9449 4488" "T15-51m-1pn.jpg"
# run_job "venv/bin/python python/equito2dall.py input/51m.jpg output/T15-51m-2pn.jpg 90 300 0 19685 11418 11398 9449 4252" "T15-51m-2pn.jpg"
# run_job "venv/bin/python python/equito2dall.py input/51m.jpg output/T15-51m-3pn.jpg 90 300 0 22000 11418 11417 9449 12007 6890" "T15-51m-3pn.jpg"

# run_job "venv/bin/python python/equito2d.py input/51m.jpg output/T15-51m-c2900-r850.jpg 40 300 0 3346 11418" "T15-51m-c2900-r850.jpg"
# run_job "venv/bin/python python/equito2d.py input/51m.jpg output/T15-51m-c2900-r1080.jpg 45 300 0 4252 11418" "T15-51m-c2900-r1080.jpg"
# run_job "venv/bin/python python/equito2d.py input/51m.jpg output/T15-51m-c2900-r1140.jpg 50 300 0 4488 11418" "T15-51m-c2900-r1140.jpg"
# run_job "venv/bin/python python/equito2d.py input/51m.jpg output/T15-51m-c2900-r1750.jpg 60 300 0 6890 11418" "T15-51m-c2900-r1750.jpg"
# run_job "venv/bin/python python/equito2d.py input/51m.jpg output/T15-51m-c2900-r2200.jpg 70 300 0 8661 11418" "T15-51m-c2900-r2200.jpg"
# run_job "venv/bin/python python/equito2d.py input/51m.jpg output/T15-51m-c2900-r2400.jpg 80 300 0 9449 11418" "T15-51m-c2900-r2400.jpg"
# run_job "venv/bin/python python/equito2d.py input/51m.jpg output/T15-51m-c2900-r2522.jpg 90 300 0 9938 11418" "T15-51m-c2900-r2522.jpg"
# run_job "venv/bin/python python/equito2d.py input/51m.jpg output/T15-51m-c2900-r2895.jpg 90 300 0 11393 11418" "T15-51m-c2900-r2895.jpg"
# run_job "venv/bin/python python/equito2d.py input/51m.jpg output/T15-51m-c2900-r2900.jpg 90 300 0 11418 11418" "T15-51m-c2900-r2900.jpg"

# run_job "venv/bin/python python/equito2d.py input/51m.jpg output/T15-51m-c2900-r850-30.jpg 40 270 0 3346 11418" "T15-51m-c2900-r850-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/51m.jpg output/T15-51m-c2900-r1080-30.jpg 45 270 0 4252 11418" "T15-51m-c2900-r1080-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/51m.jpg output/T15-51m-c2900-r1140-30.jpg 50 270 0 4488 11418" "T15-51m-c2900-r1140-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/51m.jpg output/T15-51m-c2900-r1750-30.jpg 60 270 0 6890 11418" "T15-51m-c2900-r1750-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/51m.jpg output/T15-51m-c2900-r2200-30.jpg 70 270 0 8661 11418" "T15-51m-c2900-r2200-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/51m.jpg output/T15-51m-c2900-r2400-30.jpg 80 270 0 9449 11418" "T15-51m-c2900-r2400-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/51m.jpg output/T15-51m-c2900-r2522-30.jpg 90 270 0 9938 11418" "T15-51m-c2900-r2522-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/51m.jpg output/T15-51m-c2900-r2895-30.jpg 90 270 0 11393 11418" "T15-51m-c2900-r2895-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/51m.jpg output/T15-51m-c2900-r2900-30.jpg 90 270 0 11418 11418" "T15-51m-c2900-r2900-30.jpg"

# run_job "venv/bin/python python/equito2d.py input/51m.jpg output/T15-51m-c2900-r850-60.jpg 40 330 0 3346 11418" "T15-51m-c2900-r850-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/51m.jpg output/T15-51m-c2900-r1080-60.jpg 45 330 0 4252 11418" "T15-51m-c2900-r1080-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/51m.jpg output/T15-51m-c2900-r1140-60.jpg 50 330 0 4488 11418" "T15-51m-c2900-r1140-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/51m.jpg output/T15-51m-c2900-r1750-60.jpg 60 330 0 6890 11418" "T15-51m-c2900-r1750-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/51m.jpg output/T15-51m-c2900-r2200-60.jpg 70 330 0 8661 11418" "T15-51m-c2900-r2200-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/51m.jpg output/T15-51m-c2900-r2400-60.jpg 80 330 0 9449 11418" "T15-51m-c2900-r2400-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/51m.jpg output/T15-51m-c2900-r2522-60.jpg 90 330 0 9938 11418" "T15-51m-c2900-r2522-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/51m.jpg output/T15-51m-c2900-r2895-60.jpg 90 330 0 11393 11418" "T15-51m-c2900-r2895-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/51m.jpg output/T15-51m-c2900-r2900-60.jpg 90 330 0 11418 11418" "T15-51m-c2900-r2900-60.jpg"

# run_job "venv/bin/python python/equito2dall.py input/67m.jpg output/T20-67m-1pn.jpg 90 300 0 19685 11418 9938 9449 4488" "T20-67m-1pn.jpg"
# run_job "venv/bin/python python/equito2dall.py input/67m.jpg output/T20-67m-2pn.jpg 90 300 0 19685 11418 11398 9449 4252" "T20-67m-2pn.jpg"
# run_job "venv/bin/python python/equito2dall.py input/67m.jpg output/T20-67m-3pn.jpg 90 300 0 22000 11418 11417 9449 12007 6890" "T20-67m-3pn.jpg"

# run_job "venv/bin/python python/equito2d.py input/67m.jpg output/T20-67m-c2900-r850.jpg 40 300 0 3346 11418" "T20-67m-c2900-r850.jpg"
# run_job "venv/bin/python python/equito2d.py input/67m.jpg output/T20-67m-c2900-r1080.jpg 45 300 0 4252 11418" "T20-67m-c2900-r1080.jpg"
# run_job "venv/bin/python python/equito2d.py input/67m.jpg output/T20-67m-c2900-r1140.jpg 50 300 0 4488 11418" "T20-67m-c2900-r1140.jpg"
# run_job "venv/bin/python python/equito2d.py input/67m.jpg output/T20-67m-c2900-r1750.jpg 60 300 0 6890 11418" "T20-67m-c2900-r1750.jpg"
# run_job "venv/bin/python python/equito2d.py input/67m.jpg output/T20-67m-c2900-r2200.jpg 70 300 0 8661 11418" "T20-67m-c2900-r2200.jpg"
# run_job "venv/bin/python python/equito2d.py input/67m.jpg output/T20-67m-c2900-r2400.jpg 80 300 0 9449 11418" "T20-67m-c2900-r2400.jpg"
# run_job "venv/bin/python python/equito2d.py input/67m.jpg output/T20-67m-c2900-r2522.jpg 90 300 0 9938 11418" "T20-67m-c2900-r2522.jpg"
# run_job "venv/bin/python python/equito2d.py input/67m.jpg output/T20-67m-c2900-r2895.jpg 90 300 0 11393 11418" "T20-67m-c2900-r2895.jpg"
# run_job "venv/bin/python python/equito2d.py input/67m.jpg output/T20-67m-c2900-r2900.jpg 90 300 0 11418 11418" "T20-67m-c2900-r2900.jpg"

# run_job "venv/bin/python python/equito2d.py input/67m.jpg output/T20-67m-c2900-r850-30.jpg 40 270 0 3346 11418" "T20-67m-c2900-r850-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/67m.jpg output/T20-67m-c2900-r1080-30.jpg 45 270 0 4252 11418" "T20-67m-c2900-r1080-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/67m.jpg output/T20-67m-c2900-r1140-30.jpg 50 270 0 4488 11418" "T20-67m-c2900-r1140-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/67m.jpg output/T20-67m-c2900-r1750-30.jpg 60 270 0 6890 11418" "T20-67m-c2900-r1750-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/67m.jpg output/T20-67m-c2900-r2200-30.jpg 70 270 0 8661 11418" "T20-67m-c2900-r2200-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/67m.jpg output/T20-67m-c2900-r2400-30.jpg 80 270 0 9449 11418" "T20-67m-c2900-r2400-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/67m.jpg output/T20-67m-c2900-r2522-30.jpg 90 270 0 9938 11418" "T20-67m-c2900-r2522-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/67m.jpg output/T20-67m-c2900-r2895-30.jpg 90 270 0 11393 11418" "T20-67m-c2900-r2895-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/67m.jpg output/T20-67m-c2900-r2900-30.jpg 90 270 0 11418 11418" "T20-67m-c2900-r2900-30.jpg"

# run_job "venv/bin/python python/equito2d.py input/67m.jpg output/T20-67m-c2900-r850-60.jpg 40 330 0 3346 11418" "T20-67m-c2900-r850-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/67m.jpg output/T20-67m-c2900-r1080-60.jpg 45 330 0 4252 11418" "T20-67m-c2900-r1080-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/67m.jpg output/T20-67m-c2900-r1140-60.jpg 50 330 0 4488 11418" "T20-67m-c2900-r1140-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/67m.jpg output/T20-67m-c2900-r1750-60.jpg 60 330 0 6890 11418" "T20-67m-c2900-r1750-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/67m.jpg output/T20-67m-c2900-r2200-60.jpg 70 330 0 8661 11418" "T20-67m-c2900-r2200-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/67m.jpg output/T20-67m-c2900-r2400-60.jpg 80 330 0 9449 11418" "T20-67m-c2900-r2400-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/67m.jpg output/T20-67m-c2900-r2522-60.jpg 90 330 0 9938 11418" "T20-67m-c2900-r2522-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/67m.jpg output/T20-67m-c2900-r2895-60.jpg 90 330 0 11393 11418" "T20-67m-c2900-r2895-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/67m.jpg output/T20-67m-c2900-r2900-60.jpg 90 330 0 11418 11418" "T20-67m-c2900-r2900-60.jpg"

# run_job "venv/bin/python python/equito2dall.py input/83m.jpg output/T25-83m-1pn.jpg 90 10 0 19685 11418 9938 9449 4488" "T25-83m-1pn.jpg"
# run_job "venv/bin/python python/equito2dall.py input/83m.jpg output/T25-83m-2pn.jpg 90 10 0 19685 11418 11398 9449 4252" "T25-83m-2pn.jpg"
run_job "venv/bin/python python/equito2dall.py input/83m.jpg output/T25-83m-3pn.jpg 90 10 0 22000 11418 11417 9449 12007 6890" "T25-83m-3pn.jpg"

# run_job "venv/bin/python python/equito2d.py input/83m.jpg output/T25-83m-c2900-r2200+c2900-r850-10.jpg 90 10 0 12008 11418" "T25-83m-c2900-r2200+c2900-r850-10.jpg"
# run_job "venv/bin/python python/equito2d.py input/83m.jpg output/T25-83m-c2900-r1080.jpg 45 300 0 4252 11418" "T25-83m-c2900-r1080.jpg"
# run_job "venv/bin/python python/equito2d.py input/83m.jpg output/T25-83m-c2900-r1140.jpg 50 300 0 4488 11418" "T25-83m-c2900-r1140.jpg"
# run_job "venv/bin/python python/equito2d.py input/83m.jpg output/T25-83m-c2900-r1750.jpg 60 300 0 6890 11418" "T25-83m-c2900-r1750.jpg"
# run_job "venv/bin/python python/equito2d.py input/83m.jpg output/T25-83m-c2900-r2200.jpg 70 300 0 8661 11418" "T25-83m-c2900-r2200.jpg"
# run_job "venv/bin/python python/equito2d.py input/83m.jpg output/T25-83m-c2900-r2400.jpg 80 300 0 9449 11418" "T25-83m-c2900-r2400.jpg"
# run_job "venv/bin/python python/equito2d.py input/83m.jpg output/T25-83m-c2900-r2522.jpg 90 300 0 9938 11418" "T25-83m-c2900-r2522.jpg"
# run_job "venv/bin/python python/equito2d.py input/83m.jpg output/T25-83m-c2900-r2895.jpg 90 300 0 11393 11418" "T25-83m-c2900-r2895.jpg"
# run_job "venv/bin/python python/equito2d.py input/83m.jpg output/T25-83m-c2900-r2900.jpg 90 300 0 11418 11418" "T25-83m-c2900-r2900.jpg"

# run_job "venv/bin/python python/equito2d.py input/83m.jpg output/T25-83m-c2900-r2200+c2900-r850-30.jpg 90 30 0 12008 11418" "T25-83m-c2900-r2200+c2900-r850-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/83m.jpg output/T25-83m-c2900-r1080-30.jpg 45 270 0 4252 11418" "T25-83m-c2900-r1080-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/83m.jpg output/T25-83m-c2900-r1140-30.jpg 50 270 0 4488 11418" "T25-83m-c2900-r1140-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/83m.jpg output/T25-83m-c2900-r1750-30.jpg 60 270 0 6890 11418" "T25-83m-c2900-r1750-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/83m.jpg output/T25-83m-c2900-r2200-30.jpg 70 270 0 8661 11418" "T25-83m-c2900-r2200-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/83m.jpg output/T25-83m-c2900-r2400-30.jpg 80 270 0 9449 11418" "T25-83m-c2900-r2400-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/83m.jpg output/T25-83m-c2900-r2522-30.jpg 90 270 0 9938 11418" "T25-83m-c2900-r2522-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/83m.jpg output/T25-83m-c2900-r2895-30.jpg 90 270 0 11393 11418" "T25-83m-c2900-r2895-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/83m.jpg output/T25-83m-c2900-r2900-30.jpg 90 270 0 11418 11418" "T25-83m-c2900-r2900-30.jpg"

# run_job "venv/bin/python python/equito2d.py input/83m.jpg output/T25-83m-c2900-r2200+c2900-r850-20.jpg 90 20 0 12008 11418" "T25-83m-c2900-r2200+c2900-r850-20.jpg"
# run_job "venv/bin/python python/equito2d.py input/83m.jpg output/T25-83m-c2900-r1080-60.jpg 45 330 0 4252 11418" "T25-83m-c2900-r1080-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/83m.jpg output/T25-83m-c2900-r1140-60.jpg 50 330 0 4488 11418" "T25-83m-c2900-r1140-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/83m.jpg output/T25-83m-c2900-r1750-60.jpg 60 330 0 6890 11418" "T25-83m-c2900-r1750-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/83m.jpg output/T25-83m-c2900-r2200-60.jpg 70 330 0 8661 11418" "T25-83m-c2900-r2200-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/83m.jpg output/T25-83m-c2900-r2400-60.jpg 80 330 0 9449 11418" "T25-83m-c2900-r2400-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/83m.jpg output/T25-83m-c2900-r2522-60.jpg 90 330 0 9938 11418" "T25-83m-c2900-r2522-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/83m.jpg output/T25-83m-c2900-r2895-60.jpg 90 330 0 11393 11418" "T25-83m-c2900-r2895-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/83m.jpg output/T25-83m-c2900-r2900-60.jpg 90 330 0 11418 11418" "T25-83m-c2900-r2900-60.jpg"

# run_job "venv/bin/python python/equito2dall.py input/99m.jpg output/T30-99m-1pn.jpg 90 300 0 19685 11418 9938 9449 4488" "T30-99m-1pn.jpg"
# run_job "venv/bin/python python/equito2dall.py input/99m.jpg output/T30-99m-2pn.jpg 90 300 0 19685 11418 11398 9449 4252" "T30-99m-2pn.jpg"
# run_job "venv/bin/python python/equito2dall.py input/99m.jpg output/T30-99m-3pn.jpg 90 300 0 22000 11418 11417 9449 12007 6890" "T30-99m-3pn.jpg"

# run_job "venv/bin/python python/equito2d.py input/99m.jpg output/T30-99m-c2900-r2200+c2900-r850-1.jpg 90 300 0 12008 11418" "T30-99m-c2900-r2200+c2900-r850-1.jpg"
# run_job "venv/bin/python python/equito2d.py input/99m.jpg output/T30-99m-c2900-r1080.jpg 45 300 0 4252 11418" "T30-99m-c2900-r1080.jpg"
# run_job "venv/bin/python python/equito2d.py input/99m.jpg output/T30-99m-c2900-r1140.jpg 50 300 0 4488 11418" "T30-99m-c2900-r1140.jpg"
# run_job "venv/bin/python python/equito2d.py input/99m.jpg output/T30-99m-c2900-r1750.jpg 60 300 0 6890 11418" "T30-99m-c2900-r1750.jpg"
# run_job "venv/bin/python python/equito2d.py input/99m.jpg output/T30-99m-c2900-r2200.jpg 70 300 0 8661 11418" "T30-99m-c2900-r2200.jpg"
# run_job "venv/bin/python python/equito2d.py input/99m.jpg output/T30-99m-c2900-r2400.jpg 80 300 0 9449 11418" "T30-99m-c2900-r2400.jpg"
# run_job "venv/bin/python python/equito2d.py input/99m.jpg output/T30-99m-c2900-r2522.jpg 90 300 0 9938 11418" "T30-99m-c2900-r2522.jpg"
# run_job "venv/bin/python python/equito2d.py input/99m.jpg output/T30-99m-c2900-r2895.jpg 90 300 0 11393 11418" "T30-99m-c2900-r2895.jpg"
# run_job "venv/bin/python python/equito2d.py input/99m.jpg output/T30-99m-c2900-r2900.jpg 90 300 0 11418 11418" "T30-99m-c2900-r2900.jpg"

# run_job "venv/bin/python python/equito2d.py input/99m.jpg output/T30-99m-c2900-r2200+c2900-r850-1-30.jpg 90 270 0 12008 11418" "T30-99m-c2900-r2200+c2900-r850-1-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/99m.jpg output/T30-99m-c2900-r1080-30.jpg 45 270 0 4252 11418" "T30-99m-c2900-r1080-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/99m.jpg output/T30-99m-c2900-r1140-30.jpg 50 270 0 4488 11418" "T30-99m-c2900-r1140-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/99m.jpg output/T30-99m-c2900-r1750-30.jpg 60 270 0 6890 11418" "T30-99m-c2900-r1750-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/99m.jpg output/T30-99m-c2900-r2200-30.jpg 70 270 0 8661 11418" "T30-99m-c2900-r2200-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/99m.jpg output/T30-99m-c2900-r2400-30.jpg 80 270 0 9449 11418" "T30-99m-c2900-r2400-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/99m.jpg output/T30-99m-c2900-r2522-30.jpg 90 270 0 9938 11418" "T30-99m-c2900-r2522-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/99m.jpg output/T30-99m-c2900-r2895-30.jpg 90 270 0 11393 11418" "T30-99m-c2900-r2895-30.jpg"
# run_job "venv/bin/python python/equito2d.py input/99m.jpg output/T30-99m-c2900-r2900-30.jpg 90 270 0 11418 11418" "T30-99m-c2900-r2900-30.jpg"

# run_job "venv/bin/python python/equito2d.py input/99m.jpg output/T30-99m-c2900-r2200+c2900-r850-1-60.jpg 90 330 0 12008 11418" "T30-99m-c2900-r2200+c2900-r850-1-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/99m.jpg output/T30-99m-c2900-r1080-60.jpg 45 330 0 4252 11418" "T30-99m-c2900-r1080-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/99m.jpg output/T30-99m-c2900-r1140-60.jpg 50 330 0 4488 11418" "T30-99m-c2900-r1140-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/99m.jpg output/T30-99m-c2900-r1750-60.jpg 60 330 0 6890 11418" "T30-99m-c2900-r1750-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/99m.jpg output/T30-99m-c2900-r2200-60.jpg 70 330 0 8661 11418" "T30-99m-c2900-r2200-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/99m.jpg output/T30-99m-c2900-r2400-60.jpg 80 330 0 9449 11418" "T30-99m-c2900-r2400-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/99m.jpg output/T30-99m-c2900-r2522-60.jpg 90 330 0 9938 11418" "T30-99m-c2900-r2522-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/99m.jpg output/T30-99m-c2900-r2895-60.jpg 90 330 0 11393 11418" "T30-99m-c2900-r2895-60.jpg"
# run_job "venv/bin/python python/equito2d.py input/99m.jpg output/T30-99m-c2900-r2900-60.jpg 90 330 0 11418 11418" "T30-99m-c2900-r2900-60.jpg"

end_all=$(date +%s)
total_runtime=$((end_all - start_all))

echo "🎉 All jobs finished in ${total_runtime}s"