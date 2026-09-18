import { AppBskyEmbedGallery, AppBskyEmbedImages } from "@atproto/api";
import { ImageMedia } from "../interfaces/extendedMedia";

export default async function ConvertImage(image:AppBskyEmbedImages.View | AppBskyEmbedGallery.View) : Promise<ImageMedia[]>{
    const media:ImageMedia[] = [];
    if ('images' in image){
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
    }else if ('items' in image){
        image.items.forEach((img)=>{
            const vi = img as AppBskyEmbedImages.ViewImage;
            media.push({
                altText:vi.alt,
                size:{width:vi.aspectRatio?.width as number,height:vi.aspectRatio?.height as number},
                thumbnail_url:vi.thumb,
                type:"image",
                url:vi.fullsize,
                isGif:false
            })
        })
    }
    
    return media;
}