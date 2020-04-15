require("dotenv").config();

const Koa = require("koa");
const router = require("koa-router")();
const app = (module.exports = new Koa());

const path = require("path");
const views = require("koa-views");
app.use(views(path.join(__dirname, "/views"), { extension: "ejs" }));

const NONCE = "EDNnf03nceIOfn39fn3e9h3sdfa";

const APP_KEY = process.env.APP_KEY;
// const APP_SECRET = process.env.APP_SECRET;
const SCOPE = process.env.SCOPE;
const APP_URL = process.env.APP_URL;

router
  .get("/shopify", shopHandler)
  .get("/callback", callbackHandler)
  .get("/home", homeHandler)
  .get("/about", aboutHandler);

app.use(router.routes());

async function shopHandler(ctx) {
  console.log("===== shopHandler =====");
  console.log(ctx.request);

  const shop = ctx.request.query.shop;
  if (shop) {
    const state = NONCE;
    const redirectUri = `${APP_URL}/callback`;
    const installUrl = `/oauth/authorize?client_id=${APP_KEY}&scope=${SCOPE}&state=${state}&redirect_uri=${redirectUri}`;

    ctx.cookies.set("state", state);
    await ctx.render("index", {
      apiKey: APP_KEY,
      shopOrigin: shop,
      installUrl
    });
  } else {
    ctx.status = 400;
    ctx.body = {
      msg: "Missing 'shop' parameter."
    };
  }
}

async function callbackHandler(ctx) {
  console.log("===== callbackHandler =====");
  console.log({ ...ctx.request.query });

  const { shop, hmac, code, state } = ctx.request.query;

  const appRedirectUrl = `https://${shop}/admin/apps/${APP_KEY}/home`;

  if (state !== NONCE) {
    ctx.status = 403;
    ctx.body = { msg: "Request origin cannot be verified" };
    return;
  }

  if (shop && hmac && code) {
    ctx.redirect(appRedirectUrl);
  } else {
    ctx.status = 400;
    ctx.body = { msg: "Required parameters missing" };
    return;
  }
}

async function homeHandler(ctx) {
  console.log("===== homeHandler =====");
  console.log(ctx.request);
  console.log({ ...ctx.request.query });

  const { shop } = ctx.request.query;
  await ctx.render("home", {
    apiKey: APP_KEY,
    shopOrigin: shop
  });
}

async function aboutHandler(ctx) {
  console.log("===== aboutHandler =====");
  console.log(ctx.request);
  console.log({ ...ctx.request.query });

  const { shop } = ctx.request.query;
  await ctx.render("about", {
    apiKey: APP_KEY,
    shopOrigin: shop
  });
}

app.use(async (ctx, next) => {
  if (parseInt(ctx.status) === 404 && ctx.request.url !== "/favicon.ico") {
    console.log("===== 404 =====");

    console.log(ctx.request);
    ctx.status = 404;
    ctx.body = { msg: `404: ${ctx.request.url} Not found` };
  }
});

if (!module.parent) app.listen(3700);
