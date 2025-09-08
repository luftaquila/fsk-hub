# Formula Student Korea Service Hub

## Prerequisites

```sh
git clone https://github.com/luftaquila/fsk-hub.git --recursive

cd fsk-hub
cp .env.example .env

npm --prefix web/record ci
npm --prefix energymeter/viewer/web ci

# create auth files
htpasswd -c .htpasswd-admin <username> # admin   : grant all services
cp .htpasswd-admin .htpasswd-official  # official: grant queue management
cp .htpasswd-admin .htpasswd-ksae      # ksae    : grant enroll management
```

### Optional configurations

```sh
# add more users
htpasswd .htpasswd-admin <newuser>
htpasswd .htpasswd-official <newuser>
htpasswd .htpasswd-ksae <newuser>

# set SMS service environment variables for queue notification
#   NAVER_CLOUD_ACCESS_KEY     : Naver Cloud Access Key ID
#   NAVER_CLOUD_SECRET_KEY     : Naver Cloud Access Key Secret
#   NAVER_CLOUD_SMS_SERVICE_ID : Naver Cloud SMS API Service ID
#   PHONE_NUMBER_SMS_SENDER    : registered sender number (without -)
vi .env
```

## Run

```sh
sudo docker compose up --detach
```
