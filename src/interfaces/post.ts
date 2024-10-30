import { ExtendedMedia } from "./extendedMedia";

export interface BskyPost{
    allSameType:boolean, // is all the media the same type?
    combinedMediaUrl?:string | undefined, // all media combined & rendered as a single image
    date:string, // date string
    date_epoch:number, // date as epoch
    hasMedia:boolean, // does the post have media?
    hashtags:string[], // post hashtags
    lang:string | undefined, // post language
    likes:number, // post likes
    mediaUrls:string[], // media URLs
    media_extended:ExtendedMedia[], // extended media
    pollData?:never, // legacy from vxtwitter; may be removed (does bsky have polls??)
    possibly_sensitive:boolean, // is the post possibly sensitive/NSFW?
    qrt?:BskyPost | undefined, // quoted post
    qrtUrl?:string | undefined, // quoted post URL
    replies:number, // number of replies
    retweets:number, // number of re(posts?)
    text:string, // post text
    tweetId:string, // post ID
    tweetUrl:string, // post URL
    user_name?:string, // user name of the post author
    user_profile_image_url:string | undefined, // author profile image URL
    user_screen_name:string, // author screen name
}