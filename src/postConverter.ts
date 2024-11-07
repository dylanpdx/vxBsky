import { AppBskyEmbedExternal, AppBskyEmbedImages, AppBskyEmbedRecord, AppBskyEmbedRecordWithMedia, AppBskyEmbedVideo, AppBskyFeedPost } from "@atproto/api"
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { BskyPost } from "./interfaces/post"
import { ExtendedMedia, ImageMedia } from "./interfaces/extendedMedia"
import ConvertImage from "./embedConverters/imageConverter";
import ConvertVideo from "./embedConverters/videoConverter";
import { ViewRecord } from "@atproto/api/dist/client/types/app/bsky/embed/record";
import getConfig from "./config";
import { getPostFromUri } from "./bsky-api";
import ConvertExternal from "./embedConverters/externalConverter";

type BskyEmbeds = 
AppBskyEmbedImages.View | // image
AppBskyEmbedVideo.View |  // video
AppBskyEmbedExternal.View | // external (link)
AppBskyEmbedRecord.View | // record (qrt)
AppBskyEmbedRecordWithMedia.View; // recordWithMedia (qrt with media)

const embedHandlers: {[name:string]:
    (embed:BskyEmbeds)=>Promise<ExtendedMedia[]>} ={
    'app.bsky.embed.images':async (embed:BskyEmbeds)=>{return ConvertImage(embed as AppBskyEmbedImages.View)},
    'app.bsky.embed.video':async (embed:BskyEmbeds)=>{return ConvertVideo(embed as AppBskyEmbedVideo.View)},
    'app.bsky.embed.external':async (embed:BskyEmbeds)=>{return ConvertExternal(embed as AppBskyEmbedExternal.View)},
}

async function getPostMedia(post:PostView):Promise<ExtendedMedia[]>{
    const media:ExtendedMedia[] = [];
    if (post.embed == null) return media;

    const normalizedType=(post.embed.$type as string).replace("#view","");
    if(embedHandlers[normalizedType]){
        const handler = embedHandlers[normalizedType];
        if(handler){
            media.push(...(await handler(post.embed as BskyEmbeds)));
        }
    }else if (normalizedType == 'app.bsky.embed.recordWithMedia'){
        const actualMediaObject = (post.embed as AppBskyEmbedRecordWithMedia.View).media;
        const actualNormalizedType = (actualMediaObject.$type as string).replace("#view","");
        if(embedHandlers[actualNormalizedType]){
            const handler = embedHandlers[actualNormalizedType];
            if(handler){
                media.push(...(await handler(actualMediaObject as BskyEmbeds)));
            }
        }
    }
    return media;
}

export async function convertPost(bskyPost:PostView,context:any,followQuoted:boolean=true,profile?:string,postid?:string):Promise<BskyPost>{
    const config = getConfig(context.env);
    const postRecord = bskyPost.record as AppBskyFeedPost.Record
    const media = await getPostMedia(bskyPost);
    let convertedQuote : BskyPost | undefined = undefined;
    console.log(bskyPost);
    if (bskyPost.embed != null && bskyPost.embed.$type == 'app.bsky.embed.record#view' && followQuoted){
        const quotedPost = bskyPost.embed as AppBskyEmbedRecord.View;
        const quotedPostRecord = quotedPost.record as ViewRecord;
        console.log(quotedPost);
        convertedQuote = await convertPost(await getPostFromUri(quotedPostRecord.uri),context,false);
        if (media.length == 0){
            media.push(...convertedQuote.media_extended);
        }
    }else if (bskyPost.embed != null && bskyPost.embed.$type == 'app.bsky.embed.recordWithMedia#view' && followQuoted){
        const quotedPost = bskyPost.embed as AppBskyEmbedRecordWithMedia.View;
        const quotedPostRecord = quotedPost.record.record as ViewRecord;

        convertedQuote = await convertPost(await getPostFromUri(quotedPostRecord.uri),context,false);
        if (media.length == 0){ // this shouldn't happen since recordWithMedia embeds should always have media
            media.push(...convertedQuote.media_extended);
            console.log("media was empty, but recordWithMedia embed had media");
        }
    }

    const post : BskyPost = {
        date:postRecord.createdAt,
        date_epoch:new Date(postRecord.createdAt).getTime(),
        hasMedia:media.length > 0,
        lang: (postRecord.langs && postRecord.langs.length>0) ? postRecord.langs[0]:undefined,
        likes:bskyPost.likeCount as number,
        mediaUrls:media.map(m=>m.url),
        allSameType:media.length == 0 || media.every(m=>m.type === media[0].type),
        media_extended:media,
        possibly_sensitive:false,// TODO: implement "nsfw" tag
        qrt:convertedQuote,
        qrtUrl:undefined,// TODO: implement adding URL to quoted post
        replies:bskyPost.replyCount as number,
        retweets:bskyPost.repostCount as number,
        text:postRecord.text,
        tweetId:bskyPost.uri,
        tweetUrl:`https://bsky.app/profile/${profile}/post/${postid}`,
        user_name:bskyPost.author.displayName,
        user_profile_image_url:bskyPost.author.avatar,
        user_screen_name:bskyPost.author.handle,
        combinedMediaUrl:undefined,// TODO: combine media for posts w/ multiple images
        hashtags:postRecord.tags || []
    }

    if (config.imageCombineApi != null && post.hasMedia && post.media_extended.length>1 && post.media_extended[0].type == 'image' && post.allSameType){
        post.combinedMediaUrl = post.media_extended[0].url;
    }
    
    return post;
}