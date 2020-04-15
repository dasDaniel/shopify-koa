# shopify-koa
Shopify redirection with app-bridge using koa

## run

```sh
npm i
npm start
```

## whitelist on shopify app

* {APP_URL}/shopify
* {APP_URL}/callback

## .env

requires .env file

```ini
APP_KEY=12121212121212121212121212121212
APP_SECRET=shpss_12121212121212121212121212121212
SCOPE=read_script_tags,write_script_tags
APP_URL=https://1212121212.ngrok.io
```
