export interface ExtendedMedia{
    url:string, // media URL
    thumbnail_url?:string|undefined, // thumbnail URL
    type:"image"|"video"|"text", // media type
}

export interface ImageMedia extends ExtendedMedia{
    altText:string, // alt text
    size:{width:number,height:number}, // image size
    isGif:boolean,
}

export interface VideoMedia extends ExtendedMedia{
    altText?:string|undefined, // alt text
    size:{width:number,height:number}, // image size
}