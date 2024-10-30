import { AppBskyEmbedImages } from "@atproto/api";
import { ImageMedia } from "../interfaces/extendedMedia";

export default async function ConvertImage(image:AppBskyEmbedImages.View) : Promise<ImageMedia[]>{
    const media:ImageMedia[] = [];
    image.images.forEach((img)=>{
        media.push({
            altText:img.alt,
            size:{width:img.aspectRatio?.width as number,height:img.aspectRatio?.height as number},
            thumbnail_url:img.thumb,
            type:"image",
            url:img.fullsize,
            isGif:false
        })
    })
    return media;
}