import { Hono } from 'hono'
import { installNunjucks } from "hono-nunjucks";
import templates from "./precompiled.mjs";
import { getPost } from './bsky-api';
import { convertPost } from './postConverter';
import { BskyPost } from './interfaces/post';
import { formatEmbedDescription, formatProvider } from './msgs';
import getConfig from './config';
import { VideoMedia } from './interfaces/extendedMedia';
import { Context } from 'hono/jsx';
import { contextStorage, getContext } from 'hono/context-storage';
const { minify } = require('html-minifier-terser');
type Variables = {t: any}
const app = new Hono<{Variables:Variables}>()
app.use("*",installNunjucks({templates: templates}) as any);
app.use(contextStorage());


async function minifyh(html:string){
	return await minify(html,{collapseWhitespace:true,minifyCSS:true});
}

function determineEmbedTweet(post:BskyPost){
	if (post.qrt == null) return post;
	if (post.qrt.hasMedia && !post.hasMedia){
		return post.qrt;
	}
	return post;
}

async function renderImageTweetEmbed(c:any,post:BskyPost,imageUrl:string|string[],appnameSuffix:string=""){
	const config = getConfig(c.env);
	const t = c.get("t");
	const desc = formatEmbedDescription("image",post.text,post.qrt);

	const images = Array.isArray(imageUrl) ? imageUrl : [imageUrl];

	const rendered = t.render("image", {
		tweet: post,
		pic:images,
		host:config.url,
		desc:desc,
		urlEncodedDesc:encodeURIComponent(desc),
		tweetLink:post.tweetUrl,
		appname:formatProvider(config.appname+appnameSuffix,post),
		color:config.color,
	});

	return await minifyh(rendered);
}

async function renderTextTweetEmbed(c:any,post:BskyPost,appnameSuffix:string=""){
	const config = getConfig(c.env);
	const t = c.get("t");
	const desc = formatEmbedDescription("text",post.text,post.qrt);

	const rendered = t.render("text", {
		tweet: post,
		host:config.url,
		desc:desc,
		urlEncodedDesc:encodeURIComponent(desc),
		tweetLink:post.tweetUrl,
		appname:formatProvider(config.appname+appnameSuffix,post),
		color:config.color,
	});
	return await minifyh(rendered);
}

async function renderVideoTweetEmbed(c:any,post:BskyPost,mediaInfo:VideoMedia,appnameSuffix:string=""){
	const config = getConfig(c.env);
	const t = c.get("t");
	const desc = formatEmbedDescription("video",post.text,post.qrt);

	const rendered = t.render("video", {
		tweet:post,
		media:mediaInfo,
		host:config.url,
		desc:desc,
		urlEncodedDesc:encodeURIComponent(desc),
		tweetLink:post.tweetUrl,
		appname:formatProvider(config.appname+appnameSuffix,post),
		color:config.color,
	});
	return await minifyh(rendered);
}

async function message(c:any,text:string){
	const config = getConfig(c.env);
	const t = c.get("t");
	const rendered = t.render("default", {
		message: text,
		color: config.color,
		appname: config.appname,
		repo: config.repo,
		url: config.url,
	});
	return await minifyh(rendered);
}

app.get('/', async (c) => {
	return c.redirect(getConfig(c.env).repo);
})

app.get('/oembed.json', async (c) => {
	const req = c.req;
	return c.json({
		"type"          : req.query('ttype'),
		"version"       : "1.0",
		"provider_name" : req.query('provider'),
		"provider_url"  : getConfig(c.env).url,
		"title"         : req.query('desc'),
		"author_name"   : req.query('user'),
		"author_url"    : req.query('link'),
	});
})

async function handleEmbedPost(profile:string,postid:string,embedIndex:number){
	const c = getContext<Env>();
	const config=getConfig(c.env);
	const post = await getPost(profile,postid)
	const convertedPost = await convertPost(post,c,true,profile,postid);

	const isApi=false;
	if (isApi){
		return c.json(convertedPost);
	}
	
	const isDirectEmbed=false; // TODO: implement direct embeds
	if (isDirectEmbed){
		return c.html(message(c,"Direct embeds are not yet implemented"));
	}else{
		let embedPost = determineEmbedTweet(convertedPost);
		if (!embedPost.hasMedia){
			// render text tweet
			return c.html(await renderTextTweetEmbed(c,convertedPost,""));
		}else if (embedPost.allSameType && embedPost.media_extended[0].type == 'image' && embedIndex == -1 && embedPost.combinedMediaUrl != null){
			// render single media tweet
			return c.html(await renderImageTweetEmbed(c,convertedPost,embedPost.combinedMediaUrl," - See original post for full quality"));
		}else{

			if (embedIndex == -1 && embedPost.media_extended.length > 1 && embedPost.allSameType && embedPost.media_extended[0].type == 'image' && config.imageCombineApi == null){
				// if all the requirements for combining images are met, but the image combine api is not set, embed multiple images in one embed
				return c.html(await renderImageTweetEmbed(c,convertedPost,embedPost.mediaUrls));
			}

			// render multi media tweet
			if (embedIndex == -1){
				embedIndex=0;
			}
			const media = embedPost.media_extended[embedIndex];
			let suffix = "";
			if (embedPost.media_extended.length > 1){
				suffix = ` - Media ${embedIndex+1}/${embedPost.media_extended.length}`;
			}
			if (media.type == 'image'){
				return c.html(await renderImageTweetEmbed(c,embedPost,media.url,suffix));
			}else if (media.type == 'video'){
				if (config.videoConvertApi != null){
					return c.html(await renderVideoTweetEmbed(c,convertedPost,media as VideoMedia,suffix));
				}
				else{
					return c.html(await message(c,`Videos are not currently supported in ${config.appname}`));
				}
			}
		}
	}
	return c.text("unsupported");
}

app.get('/profile/:profile/post/:postid/:index?', async (c) => {
	const { profile, postid,index } = c.req.param();
	let embedIndex = index ? (parseInt(index)-1) : -1;
	
	// TODO: handle caching

	return await handleEmbedPost(profile, postid,embedIndex);
});

export default app