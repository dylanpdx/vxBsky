# VxBsky

Cloudflare workers app that fixed Bluesky video embeds to services like Discord and Telegram.

## How to use the hosted version
Simply replace `bsky.app` in Bluesky URLs with vxbsky.app

`https://bsky.app/profile/tobyfox.undertale.com/post/3l7omnfaphm2c`

turns into

`https://vxbsky.app/profile/tobyfox.undertale.com/post/3l7omnfaphm2c`

## Note about code
At the moment, this is an almost direct port of [vxTwitter](https://github.com/dylanpdx/BetterTwitFix), so a lot of functions and variables in the code refer to Twitter-related wording (i.e Tweets, QRTs, retweets, etc.)
This will hopefully be refactored in the future.