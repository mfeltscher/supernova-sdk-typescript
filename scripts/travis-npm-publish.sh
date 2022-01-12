#!/bin/sh
# This does similar to npm deploy provider but will fail in case if you try to overwrite a version

echo //registry.npmjs.org/:_authToken=${NPMJS_API_TOKEN} > .npmrc
npm publish
