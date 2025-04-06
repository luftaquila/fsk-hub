# Formula Student Korea Service Hub

## Prerequisites

```sh
# clone repository
git clone https://github.com/luftaquila/fsk-hub.git --recursive
cd fsk-hub

# install dependencies
npm --prefix energymeter/viewer/web ci

# copy required ssl certificates
mkdir -p .ssl
cp /path/to/domain.cert.pem ./ssl
cp /path/to/private.key.pem ./ssl

# create authentication file
htpasswd -c .htpasswd <username>
htpasswd .htpasswd <newuser> # add another user
```

## Run

```sh
sudo docker compose up --detach
```
