---------------
# WEB Full-stack project   

* 결과물 링크 : <https://sangking.tk/>

---------------
## 1. __프로젝트 소개__   
---------------

### 1-1. 프로젝트명 : 다모EASY Ver.1 (업데이트 예정)   

### 1-2. 프로젝트 개요
- Node.js 기반 SNS 서비스 웹 어플리케이션
- __개인 프로젝트 (KSKyeong)__
- __아이디어__ : 여러 사람이 모임을 가질 때, 모임 장소를 정하는 것은 참 쉽지 않은 일이다. <br> 코로나19 종식 이후, 정상화 된 일상 속, 많은 모임들에 도움을 줄 번개모임 플랫폼을 "개발부터 배포" 까지 해보자!!  
- __구현 할 기능__ :　로그인, 게시판, 실시간 채팅, 친구 맺기,      
         ＋ _지도 기능(ver.2),  로그 작성 기능(ver.2), 학습을 통한 장소 추천 기능(ver.3)_
   


### 1-3. 개발 환경

* 사용 언어 및 기술, 프레임워크
   * __Front-end__ : Javascript, HTML, CSS, _Bootstrap, Semantic UI_
   * __Back-end__ : Node.js, Javascript, MongoDB, _Express_
   * __Server__ : AWS ec2 (Ubuntu 20.04.2 LTS)
      

* 주요 라이브러리 및 모듈, IDE
   * REST API, Facebook API, jQuery
   * express, http, passport, socket.io, mongoose, ejs..
   * nginx, certbot 
   * Brackets, MongoDB Compass, AWS (ec2, Route53)
   

* 형상 관리 - Git, Github

### 1-4. 개발 기간 :    
- (Ver.1) 2020.12.27 ~ 2021.02.16,      
- (Ver.2) 2020.02.16 ~ ing 


### 1-5. 개발 경과 : 
- ~ 2020.12.27 : git 기초, 형상관리 학습 및 프로젝트 계획, Node.js 학습
- 2020.12.28 ~ 2021.1.3 : DB 스키마 구성 및, 로그인 기능
- 2021.1.3 ~ 2021.1.7 : 게시판, 페이징, 댓글 기능
- 2021.1.8 ~ 2021.1.12 : 친구 요청, 수락, 조회, 삭제 기능
- 2021.1.13 ~ 2021.1.18 : 실시간 채팅 구현 with Ajax (삽질..)
- 2021.1.19 ~ 2021.1.26 : 실시간 채팅방 생성, 기본 이벤트 처리
- 2021.1.27 ~ 2021.2.6 : 약간의 삽질 + socket 모듈의 session 활용 -> 방 이벤트 모두 구현, 전체적 view 수정
- 2021.2.7 ~ 2021.2.11 : 각종 Deprecation warning 수정 및 배포 준비
- 2021.2.12 ~ 2021.2.16 : VM 내의 환경설정, 도메인 연결 및 실제 작동 테스트 완료   
   

<br>

---------------
## 2. __프로젝트 내용 (ver.1)__

---------------
### 2-1.__Express 프로젝트__
- 전체적인 구성   

> <img src="/images/프로젝트_구성.PNG" width="70%" height="70%" title="프로젝트 구성" alt="프로젝트 구성"></img>



<br><br>
### 2-2. __DB 설계__
- DB 구성   

> <img src="/images/DB_구성.PNG" width="70%" height="70%" title="DB 구성" alt="DB 구성"></img>

<br>

- DB 관계   

> <img src="/images/DB_관계.PNG" width="50%" height="50%" title="DB_관계" alt="DB_관계"></img>



<br><br>
### 2-3. __배포__
- aws ec2 ubuntu 기반 VM 생성   

> <img src="/images/ec2_세부정보.PNG" width="70%" height="70%" title="ec2_세부정보" alt="ec2_세부정보"></img>   

aws Elastic Beanstalk를 활용해볼까 했지만, 전체적인 서버 설정을 해보고 싶어 ec2를 활용하기로 함.<br> 
Ubuntu 플랫폼을 활용했음.

<br><br>
> <img src="/images/ec2_보안_inbound.PNG" width="70%" height="70%" title="ec2_보안_inbound" alt="ec2_보안_inbound"></img>   

Inbound로 22(ssh), 80(http), 443(https) 포트를 열어주었음. 

<br><br>
> <img src="/images/ec2_보안_outbound.PNG" width="70%" height="70%" title="ec2_보안_outbound" alt="ec2_보안_outbound"></img>   

Outbound를 전체로 설정 해줌.


<br><br>

- mlab 클라우드 기반 MongoDB 생성   


> <img src="/images/cloud_MongoDB.PNG" width="70%" height="70%" title="cloud_MongoDB" alt="cloud_MongoDB"></img>   

cloud MongoDB를 활용하였다. <br>
데이터 베이스 접속 허용 IP는 내 ec2 인스턴스의 Elastic IP와, 현재 로컬 PC의 IP로 설정해두었다.
<br><br>

- VM 내에 git 연동, 프로젝트 clone   

> <img src="/images/VM_git.PNG" width="80%" height="80%" title="VM_git" alt="VM_git"></img>    
   
   
VM에 ssh 접속 후, git 설치 및 연동, 프로젝트를 pull 한 상태이다. 
    
    /home/ubuntu/Project 
    
경로에 프로젝트가 위치한 걸 볼 수 있다.


<br><br>
> <img src="/images/server_run.PNG" width="80%" height="80%" title="server_run" alt="server_run"></img>   

    node app.js

명령어로 서버 프로그램 실행 가능

> <img src="/images/forever_start.PNG" width="80%" height="80%" title="forever_start" alt="forever_start"></img>   


    forever start app.js

forever 모듈을 통해 장애에 대처할 수 있다.


<br><br>
- 도메인 구매(freenom) DNS name server 등록(AWS Route53)   

> <img src="/images/freenom_myDomain.PNG" width="70%" height="70%" title="freenom_myDomain" alt="freenom_myDomain"></img> 

freenom에서 sangking.tk 도메인을 무료로 구매했다. 


<br><br>
> <img src="/images/Route53.PNG" width="70%" height="70%" title="Route53" alt="Route53"></img>   

freenom 자체 DNS nameserver를 이용하지 않고, 도메인 등록, DNS 라우팅, 상태 확인 기능을 사용하기 위해 AWS의 Route53을 활용했다.


<br><br>
- 비용 고려하여 ec2 + Nginx 웹서버 사용   

AWS의 ELB는 간편하지만, 비용적 측면에서 볼 때, 토이 프로젝트에는 Nginx가 제격이라 생각함. <br>
규모가 커진다면 ELB를 활용해볼 것임. <br>

> <img src="/images/nginx_1.PNG" width="80%" height="80%" title="nginx_1" alt="nginx_1"></img>   

Nginx 모듈을 설치한 모습.

    /etc/nginx
    
내부 모습이다.

<br><br>
> <img src="/images/nginx_root.PNG" width="50%" height="50%" title="nginx_root" alt="nginx_root"></img>   


    /etc/nginx/sites-available
내의 default 파일에서 서버 블록을 설정해주었다.<br>
이후의 https 통신을 위해 443 포트를 열어둠.

<br><br>
- Certbot 무료인증서 발급 및 https SSL 적용   

> <img src="/images/certbot.PNG" width="80%" height="80%" title="certbot" alt="certbot"></img>   

Certbot을 통해 무료인증서를 발급함. 

    /etc/letsencrypt/live/sangking.tk-0001
내에 인증 관련 키 파일들을 볼 수 있다.

<br><br>
> <img src="/images/nginx_protocol.PNG" width="50%" height="50%" title="nginx_protocol" alt="nginx_protocol"></img>   


ssl 프로토콜 설정.

<br><br>
> <img src="/images/nginx_SSL.PNG" width="70%" height="70%" title="nginx_SSL" alt="nginx_SSL"></img>   

발급 받은 인증서 적용.


<br><br>
- Facebook Oauth 사용 -> 리디렉션 URL (https 요구) 설정   

> <img src="/images/facebook_설정1.PNG" width="70%" height="70%" title="facebook_설정1" alt="facebook_설정1"></img>   

사용자 인증 과정 중 페이스북 Oauth를 활용 하기 때문에 https://developers.facebook.com/ 에서 내 앱을 만들어 주었다. 

<br>

> <img src="/images/facebook_설정2.PNG" width="70%" height="70%" title="facebook_설정2" alt="facebook_설정2"></img>   

앱 도메인과 리디렉션 URI를 내 도메인으로 설정해줌.

<br><br>

---------------
## 3. __실행 시 설치, 설정(간략) 및 참고 자료__   
---------------


### 3-1. Node.js - (app.js, chatting.html)
- node 설치, npm 설치   
https://nodejs.org/ko/download/



- app.js 내 facebook auth 위한 설정   

> <img src="/images/config2.PNG" width="70%" height="70%" title="config2" alt="config2"></img>   
내 앱의 ID와 시크릿코드, 콜백으로 넘겨받을 URL을 설정 해준다.

- chating.html 내 socket.io 모듈 활용    

> <img src="/images/chatting.PNG" width="70%" height="70%" title="chatting" alt="chatting"></img>   
내 웹서버 주소 혹은 localhost:PORT를 설정 해준다.

### 3-2. MongoDB - (config.js, app.js)
- config/config.js 내 설정  

> <img src="/images/config1.PNG" width="70%" height="70%" title="config1" alt="config1"></img>    
내 DB 접속 url 입력

- config/config.js 내 설정   

> <img src="/images/app_session.PNG" width="70%" height="70%" title="app_session" alt="app_session"></img>   
세션 저장할 DB url 입력

### 3-3. 참고한 자료
- ec2 내 환경설정   

    - 인스턴스 접속(ssh)
    https://goddaehee.tistory.com/181  
    - git bash 활용
    https://eatdeveloplove.tistory.com/47   
    - git을 통해 프로젝트 불러오기   
    https://velog.io/@jungsw586/AWS-EC2-%EC%84%9C%EB%B2%84%EB%A5%BC-%ED%99%9C%EC%9A%A9%ED%95%98%EC%97%AC-Git%EC%97%90-%EC%A0%80%EC%9E%A5%EB%90%9C-%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-Deply-%ED%95%B4%EB%B3%B4%EA%B8%B0   
    - AWS EC2 인스턴스에 고정 IP (Elastic IP) 연결하기   
    https://hoing.io/archives/3558 <br>
    https://assaeunji.github.io/aws/2020-03-30-elastic-ip/   
    - ubuntu root 암호 설정   
    https://studyforus.tistory.com/223   
    - vim 조작   
    https://opentutorials.org/course/730/4561   
    
    
- 도메인 생성   

    - 무료 도메인 생성   
    https://blog.lael.be/post/6070   
    - 도메인 구입 후   
    https://musma.github.io/2019/09/16/what-to-do-after-you-buy-your-new-domain-on-aws.html <br>
    https://blog.wonkyunglee.io/27   
    

- ssl 인증서 발급 및 nginx 설정   
https://blog.buffashe.com/2020/09/get-ssl-cert-via-letsencrypt/ <br>
https://extrememanual.net/13002 <br>
https://architectophile.tistory.com/12 <br>
https://m.blog.naver.com/PostView.nhn?blogId=rosycoffee&logNo=221692033510&proxyReferer=https:%2F%2Fwww.google.com%2F <br>
https://twpower.github.io/50-make-nginx-virtual-servers <br>
https://swiftcoding.org/nginx-routing-conf#nginx-redirecting <br>
https://swiftcoding.org/lightsail-firewall#how-to <br>
https://webisfree.com/2018-01-06/nginx%EB%A5%BC-%EC%82%AC%EC%9A%A9%ED%95%98%EC%97%AC-%EB%A9%80%ED%8B%B0-%EB%8F%84%EB%A9%94%EC%9D%B8-%EC%97%B0%EA%B2%B0%ED%95%98%EB%8A%94-%EB%B0%A9%EB%B2%95 <br>
https://ndb796.tistory.com/341 <br>
https://jackerlab.com/nginx-https-lets-encrypt/ <br>
https://blog.buffashe.com/2020/09/get-ssl-cert-via-letsencrypt/ <br>
https://velog.io/@prayme/ubuntu%EC%97%90-nginx-%EC%84%A4%EC%B9%98%ED%95%98%EA%B3%A0-ssl-%EC%A0%81%EC%9A%A9%ED%95%98%EA%B8%B0 <br>
https://stackoverflow.com/questions/53824640/nginx-lets-encrypt-could-not-automatically-find-a-matching-server-block <br>
https://community.letsencrypt.org/t/certbox-could-not-automatically-find-a-matching-server-block/105265 <br>
https://www.digitalocean.com/community/tutorials/how-to-set-up-let-s-encrypt-with-nginx-server-blocks-on-ubuntu-16-04

<br><br>

---------------
## 4. 개인적 평가 및 보완점
---------------
### 4.1 기능 및 서비스적 측면 
- 번개 모임 플랫폼의 기본적인 기능으로 계정 생성, 인증, 친구 요청, 수락, 삭제, 실시간 채팅 등을 만들어 SNS의 기본 목적을 달성했다고 봄.
- 직접 사용해본 사용자들의 의견으로 모바일 환경에서 편리했으면 좋겠다는 의견을 받음.
> - 프론트 프레임워크를 활용한 사용자 관점에서 더 나은 WAS를 만들어 볼 것.
> - 번개 모임을 위한 지도 서버, 추천 알고리즘 등의 추가 적용 필요.

### 4.2 기술 및 업무적 측면
- 개념으로만 이해했던 모듈화의 활용을 해볼 수 있어 좋은 경험이었다.
- 다양한 라이브러리의 활용을 위해 무수한 구글링을 하였고, 정확하고 빠르게 정보를 찾아, 프로젝트에 적용하는 방법을 익힐 수 있었다.
- 데이터베이스 설계 및 활용을 통해, 효율적인 DB 구조에 대해 고민해볼 수 있었다.
> - REST 형식에 맞는 URL 매핑의 설계가 미흡함. 더 일관된 요청방식으로 수정해볼 것.
>- Posts, Rooms 컬렉션은 상대적으로 수정이 잦으므로, SQL을 적용해보면 좋을 것.

### 4.3 느낀점
- 서버 운영 시 비용 문제를 고민할 수 있었고, 서비스 규모에 따른 최적의 비용으로 서버를 운영하는 방법을 고민할 수 있었다.
- 토이 프로젝트이지만 직접 배포해보는 경험을 할 수 있어 좋았다.
- TDD의 적용을 위해 실제 고객 (친구, 지인)을 마련하여, 무료 서비스를 통해 익숙해지는 경험을 하고 싶다.
