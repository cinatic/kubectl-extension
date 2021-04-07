#!/bin/bash

context=$1
namespace=$2
target=$3
port=$4

bindPort=61111
try_other_ports=1

echo "Enter port (leave empty to try 61111 or greater):"
read user_input

if [ -n "$user_input" ]; then
  bindPort=$user_input
  try_other_ports=0
fi

for i in {0..19}; do
  bindPort=$((bindPort + i))
  kubectl port-forward --context="$context" -n "$namespace" "$target" "$bindPort":"$port"
  exit_code=$?

  if [ "$exit_code" != "1" ] || [ "$try_other_ports" != "1" ]; then
    break
  fi
done

/bin/bash
