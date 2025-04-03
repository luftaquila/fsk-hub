# fsk-hub

## Prerequisites

```sh
git clone https://github.com/luftaquila/fsk-hub.git
cd fsk-hub

# ssl certificates required: domain.cert.pem, private.key.pem
cp /path/to/ssl/certs ./ssl

# create authentication file
htpasswd -c .htpasswd <username>
htpasswd .htpasswd <newuser> # add another user
```

## Run

```sh
sudo docker-compose up --detach
```
