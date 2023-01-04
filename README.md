## 위키독 보존

이 리포지토리는 위키독의 문서를 일부 보존하고 있으며 보존된 데이터를 활용할 수 있는 방법을 마련 중입니다.

### 보존 위키와 각 저작권

- 아름드리위키 (CC BY-SA 3.0)
- 비건편의점 WiKi
- 여성위키

### 주의사항

- 정적 웹사이트를 만드는 것은 목표로 하고 있지 않습니다(트래픽 문제).

### 사용법

#### 읽는 법

TBD

#### 미디어위키에서 불러오기

mw-dump 디렉토리의 xml 파일을 미디어위키의 [ImportDump.php] 스크립트나 Special:Import 특수 문서로 불러올 수 있습니다.

##### ImportDump.php

스크립트로 불러올 경우 "하위문서로 들여오기" 등의 기능은 사용할 수 없음에 유념하십시오.

dump 파일은 GitLab에서 바로 다운받아도 되고, 도커를 사용한다면 다음과 같이 복사하여 사용할 수 있습니다.

```sh
CONTAINER_ID=$(docker ps -qf 'name=fastcgi')

# Docker container 안으로 복사
docker cp mw-dump/veganism-0.xml "$CONTAINER_ID":/root

# Import
# 정확한 미디어위키의 위치는 사용하는 도커 이미지의 README를 참고하십시오.
# --dry-run을 생략하면 진짜로 불러옵니다.
docker exec $(docker ps -qf 'name=fastcgi') php maintenance/importDump.php \
  --report \
  --dry-run \
  /root/veganism-0.xml
```

##### Special:Import

PHP 설정 상 파일 업로드 크기 제한이 있는지 살피십시오. 실패하는 경우 xml 파일을 작은 크기로 쪼개야 할 수 있습니다.

TBD

### 개발

#### 미디어위키에서 불러올 수 있는 파일 생성하기

```
yarn generate-xml
```

[importdump.php]: https://www.mediawiki.org/wiki/Special:MyLanguage/Manual:ImportDump.php
