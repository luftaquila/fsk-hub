# fsk-hub

## Prerequisites

```sh
git clone https://github.com/luftaquila/fsk-hub.git --recursive
cd fsk-hub

# install dependencies
npm --prefix energymeter/viewer/web ci

# ssl certificates required: domain.cert.pem, private.key.pem
cp /path/to/ssl/certs ./ssl

# create authentication file
htpasswd -c .htpasswd <username>
htpasswd .htpasswd <newuser> # add another user
```

## Run

```sh
sudo docker compose up --detach
```
