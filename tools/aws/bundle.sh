#!/bin/bash

dependencies=(
    docker
    zip
    grep
)

for dependency in "${dependencies[@]}"
do
    if ! command -v $dependency &> /dev/null
    then
	echo "$dependency is not installed on your machine. Exiting."
	exit 1
    fi
done

# get latest filename so we can increment the version
unset -v latest
for file in compiled/aws/*; do
    [[ $file -nt $latest ]] && latest=$file
done
latest_filename=${latest##*/}
current_version=$(echo $latest_filename | grep -Eo '[0-9]+')
next_version=$(($current_version + 1))

docker run -it -v $PWD:$PWD -w $PWD node:14 node src/compile.js

(cd compiled/aws/; zip HastyRedirection-${next_version}.zip index.js)
