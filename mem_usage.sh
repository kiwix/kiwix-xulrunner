#!/bin/bash
max_bar_len=60
max_mem=500

while :; do
  kiwix_pid=$(pidof xulrunner-bin)
  if [[ $kiwix_pid ]]; then
    mem_mb=$(($(ps -p $kiwix_pid -o rss=)/1024))
    bar_len=$((max_bar_len*mem_mb/max_mem))
    printf "$(date +%H:%M) %4dM [%3d%%] \033[41m%${bar_len}s\033[42m%$((max_bar_len-bar_len))s\033[0m\n" $mem_mb $((100*mem_mb/max_mem)) '' ''
  else
    printf "%s ---\n" $(date +%H:%M)
  fi
  sleep 2
done