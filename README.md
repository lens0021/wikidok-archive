## 위키독 보존

이 리포지토리는 위키독의 문서를 일부 보존하고 있으며 보존된 데이터를 활용할 수 있는 방법을 마련 중입니다.

### 보존 위키와 각 저작권

- 아름드리위키 (CC BY-SA 3.0, 문서 약 1691개)
- 여성위키 (문서 약 994개)
- 비건편의점 WiKi (문서 약 382개)

### 주의사항

- 정적 웹사이트를 만드는 것은 목표로 하고 있지 않습니다(트래픽 문제).

### 사용법

#### 읽는 법

TBD

#### 미디어위키에서 불러오기

mw-dump 디렉토리의 xml 파일을 미디어위키의 [ImportDump.php] 스크립트나 Special:Import 특수 문서로 불러올 수 있습니다.

일반 이름 공간에 불러올 경우 `Project:위키독/<위키 이름>/<문서 이름>`으로 위치합니다.

##### ImportDump.php

스크립트로 불러올 경우 "하위문서로 들여오기" 등의 기능은 사용할 수 없음에 유념하십시오. 이를 피하기 위해 dump 파일에 명시된 문서 이름이 `Project:위키독/<위키 이름>/<문서 이름>`으로 고정되어 있습니다.

dump 파일은 GitLab에서 바로 다운받아도 되고, 도커를 사용한다면 다음과 같이 복사하여 사용할 수 있습니다.

```sh
# Docker container 안으로 복사
docker cp mw-dump/veganism-0.xml $(docker ps -qf 'name=fastcgi'):/root
docker cp mw-dump/womwiki0308-0.xml $(docker ps -qf 'name=fastcgi'):/root
docker cp mw-dump/areumdri-0.xml $(docker ps -qf 'name=fastcgi'):/root

# Import
# 정확한 미디어위키의 위치는 사용하는 도커 이미지의 README를 참고하십시오.
docker exec $(docker ps -qf 'name=fastcgi') php maintenance/importDump.php --username-prefix='veganism' /root/veganism-0.xml
docker exec $(docker ps -qf 'name=fastcgi') php maintenance/importDump.php --username-prefix='womwiki0308' /root/womwiki0308-0.xml
docker exec $(docker ps -qf 'name=fastcgi') php maintenance/importDump.php --username-prefix='areumdri' /root/areumdri-0.xml

# You might want to run [rebuildrecentchanges.php] to regenerate RecentChanges, and [initSiteStats.php] to update page and revision counts
docker exec $(docker ps -qf 'name=fastcgi') php maintenance/rebuildrecentchanges.php
docker exec $(docker ps -qf 'name=fastcgi') php maintenance/initSiteStats.php
```

##### Special:Import

PHP 설정 상 파일 업로드 크기 제한이 있는지 살피십시오. 실패하는 경우 xml 파일을 작은 크기로 쪼개야 할 수 있습니다.

TBD

### 개발

#### 미디어위키에서 불러올 수 있는 파일 생성하기

```
yarn generate-mw-dump
```

[importdump.php]: https://www.mediawiki.org/wiki/Special:MyLanguage/Manual:ImportDump.php
[rebuildrecentchanges.php]: https://www.mediawiki.org/wiki/Special:MyLanguage/Manual:rebuildrecentchanges.php
[initsitestats.php]: https://www.mediawiki.org/wiki/Special:MyLanguage/Manual:initSiteStats.php
