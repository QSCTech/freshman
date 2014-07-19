#!/bin/sh

cd ..
pandoc share/freshman.md  --include-in-header freshman_pheader.html -o freshman.html
pandoc share/freshman.md -o downloads/freshman.mobi
pandoc share/freshman.md -o downloads/freshman.epub

