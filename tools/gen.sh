#!/bin/bash

# 判断 protoc 和 protoc-gen-go 版本
protoc_version='3.19.3'
gen_version='1.27.1'
protoc_rst=$(protoc --version | grep $protoc_version)
gen_rst=$(protoc-gen-go --version | grep $gen_version)
echo 'Check protoc and protoc-gen-go'
echo $protoc_rst
echo $gen_rst
if [[ $protoc_rst = '' ]]; then
  echo 'Check protoc fail.'
  echo 'Please install protoc' $protoc_version
  exit 255
fi
if [[ $gen_rst = '' ]]; then
  echo 'Check protoc-gen-go fail.'
  echo 'Please install protoc-gen-go' $gen_version
  exit 255
fi

# 生成脚手架工具
rm tools/protoc-gen-violet-scaffold
if [ ! -x 'tools/protoc-gen-violet-scaffold' ]; then
  echo 'Gen protoc-gen-violet-scaffold ...'
  go build -o tools/protoc-gen-violet-scaffold tools/scaffold/*.go
  if [ $? -ne 0 ]; then
    echo 'Gen protoc-gen-violet-scaffold fail'
    exit 255
  fi
  echo 'Gen protoc-gen-violet-scaffold success'
else
  echo 'Already exist protoc-gen-violet-scaffold'
fi

# 生成 http 相关代码
echo 'Gen code ...'
protoc -Itools/apis ./tools/apis/*.proto \
  --go_out=./app/http_gen \
  --go_opt=module=github.com/xmatrixstudio/violet.server/app/http_gen \
  --plugin=protoc-gen-violet-scaffold=tools/protoc-gen-violet-scaffold \
  --violet-scaffold_out=./app/http_gen
if [ $? -ne 0 ]; then
  echo 'Gen code fail'
  exit 255
fi
echo 'Gen code success'
