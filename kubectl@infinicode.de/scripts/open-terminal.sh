#!/bin/bash

context=$1
namespace=$2
target=$3
things_to_try=('/bin/bash' '/bin/sh')

echo "Enter a command (leave empty to try defaults ${things_to_try[*]}):"
read cmd

if [ -n "$cmd" ]; then
  things_to_try=("$cmd")
fi

for i in "${things_to_try[@]}"; do
  kubectl exec --context="$context" --stdin --tty -n "$namespace" "$target" -- "$i"
  exit_code=$?

  if [ "$exit_code" != "126" ]; then
    break
  fi
done

/bin/bash
