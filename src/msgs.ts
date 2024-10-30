import { BskyPost } from "./interfaces/post"

const failedToScan="Failed to scan your link! This may be due to an incorrect link, private/suspended account, or downtime."
const failedToScanExtra = "\n\nBluesky gave me this error: "
//const tweetNotFound="Post not found."
//const unknownError="Unknown Error"
//const tweetSuspended="This Post is from a suspended account." 

const videoDescLimit=220
const tweetDescLimit=340
const providerLimit=220

function genLikesDisplay(post:BskyPost):string{
    if (post.retweets > 0){
        return `💖 ${post.likes} 🔁 ${post.retweets}`
    }else{
        return `💖 ${post.likes}`
    }
}

export function genQrtDisplay(post:BskyPost):string{
    return `\n\n【Quoting ${post.user_name} (@${post.user_screen_name}):】\n\n${post.text}`
}

export function formatProvider(base:string,post:BskyPost):string{
    let finalText=base;
    let likesText=genLikesDisplay(post);
    finalText=finalText+`\n${likesText}`;
    if (finalText.length > providerLimit){
        finalText=base;
    }
    return finalText;
}

export function formatEmbedDescription(type:"image"|"video"|"text",body:string,qrt?:BskyPost):string{
    const qrtType = qrt==null ? undefined : (qrt.hasMedia ? qrt.media_extended[0].type : "text");
    const limit = type=="video" || (qrt!=null && qrtType=="video") ? videoDescLimit : tweetDescLimit;
    let output=body;

    if (qrt != null){
        output+=genQrtDisplay(qrt);
    }

    if (output.length > limit){
        output=output.substring(0,limit-1)+"…";
        return formatEmbedDescription(type,output);
    }else{
        return output;
    }
}