# Formula Student Korea Service Hub

## Prerequisites

```sh
# clone repository
git clone https://github.com/luftaquila/fsk-hub.git --recursive
cd fsk-hub

# copy .env
cp .env.example .env

# install dependencies
npm --prefix web/record ci
npm --prefix energymeter/viewer/web ci

# create auth files
htpasswd -c .htpasswd-admin <username>
cp .htpasswd-admin .htpasswd-official
```

### Optional configurations

```sh
# add more users
htpasswd .htpasswd-admin <newuser>    # grant all services
htpasswd .htpasswd-official <newuser> # grant queue management

# set SMS service environment variables for queue notification
#   NAVER_CLOUD_ACCESS_KEY     : Naver Cloud Access Key ID
#   NAVER_CLOUD_SECRET_KEY     : Naver Cloud Access Key Secret
#   NAVER_CLOUD_SMS_SERVICE_ID : Naver Cloud SMS API Service ID
#   PHONE_NUMBER_SMS_SENDER    : registered sender number (without -)
vi .env
```

### With HTTPS

```sh
# replace following strings to your own
#   - <YOUR_PORT>: must match PORT defined in .env
#   - <YOUR_DOMAIN_NAME>
#   - <PATH_TO_YOUR_CERTIFICATE>
#   - <PATH_TO_YOUR_CERTIFICATE_KEY>
vi nginx.conf

sudo cp nginx.conf /etc/nginx/sites-available/fsk-hub.conf
sudo ln -s /etc/nginx/sites-available/fsk-hub.conf /etc/nginx/sites-enabled/fsk-hub.conf
sudo systemctl restart nginx
```

## Run

```sh
sudo docker compose up --detach
```
