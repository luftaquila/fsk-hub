# Formula Student Korea Service Hub

## Prerequisites

```sh
# clone repository
git clone https://github.com/luftaquila/fsk-hub.git --recursive
cd fsk-hub

# install dependencies
npm --prefix web/record ci
npm --prefix energymeter/viewer/web ci

# copy required ssl certificates
mkdir -p .ssl
cp /path/to/domain.cert.pem ./ssl
cp /path/to/private.key.pem ./ssl

# create authentication file
htpasswd -c .htpasswd-admin <username>
cp .htpasswd-admin .htpasswd-official
htpasswd <htpasswd> <newuser> # add another user

# set sms service environment variables (optional)
#   NAVER_CLOUD_ACCESS_KEY     : Naver Cloud Access Key ID
#   NAVER_CLOUD_SECRET_KEY     : Naver Cloud Access Key Secret
#   NAVER_CLOUD_SMS_SERVICE_ID : Naver Cloud SMS API Service ID
#   PHONE_NUMBER_SMS_SENDER    : registered sender number (without -)
cp .env.example .env
vi .env
```

## Run

```sh
sudo docker compose up --detach
```
