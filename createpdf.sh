#!/bin/sh

pandoc share/freshman.md  --include-in-header freshman_pheader.html -o freshman.html
pandoc share/freshman.md -o downloads/freshman.epub
echo 请用Chrome浏览器打开freshman.html并打印为pdf格式；
echo 用calibre打开downloads/freshman.epub并转换为mobi格式。
echo 

