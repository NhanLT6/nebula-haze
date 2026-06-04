#!/bin/bash
set -e

LATEST=$(ls releases/nebula-haze-*.jar | sort -V | tail -1)
VERSION=$(basename "$LATEST" .jar | grep -oP '\d+\.\d+\.\d+')
TAG="v$VERSION"

echo "Releasing $LATEST as $TAG"

git push origin master
gh release create "$TAG" "$LATEST" --title "$TAG"
