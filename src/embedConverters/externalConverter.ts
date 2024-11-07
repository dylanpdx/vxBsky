import { AppBskyEmbedExternal } from "@atproto/api";
import { ExtendedMedia, ImageMedia } from "../interfaces/extendedMedia";

export default async function ConvertExternal(externalPost:AppBskyEmbedExternal.View) : Promise<ExtendedMedia[]>{
    const media:ExtendedMedia[] = [];
    if (externalPost.external.uri.startsWith("https://media.tenor.com/")){
        // tenor gif
        let width = 500;
        let height = 500;
        const url = new URL(externalPost.external.uri);
        if (url.searchParams.has('hh') && url.searchParams.has('ww')){
            width = parseInt(url.searchParams.get('ww') as string);
            height = parseInt(url.searchParams.get('hh') as string);
        }
        
        const gif:ImageMedia={
            url:externalPost.external.uri,
            type:'image',
            thumbnail_url:externalPost.external.thumb,
            isGif:true,
            altText:externalPost.external.title,
            size:{width:width,height:height},
        };
        media.push(gif);
    }else{
        // TODO: handle generic external links
    }
    return media;
}