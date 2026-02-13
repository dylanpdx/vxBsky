import { AppBskyEmbedVideo } from "@atproto/api";
import { VideoMedia } from "../interfaces/extendedMedia";
import { parse, types, stringify } from 'hls-parser';
import zlib from 'zlib';
import { promisify } from 'util';
import getConfig from "../config";
const gzip = promisify(zlib.gzip);
const re = /video\.bsky\.app\/watch\/(did.*?)\//gm;
export default async function ConvertVideo(video:AppBskyEmbedVideo.View) : Promise<VideoMedia[]>{
    const config = getConfig();

    if (!config.videoConvertApi){
        return [];
    }

    const didMatch = re.exec(video.playlist);
    if (!didMatch || didMatch.length < 2){
        return [];
    }

    const url = `https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${didMatch[1]}&cid=${video.cid}`;

    const media:VideoMedia[] = [
    {
        altText:video.alt,
        size:{width:video.aspectRatio?.width as number,height:video.aspectRatio?.height as number},
        thumbnail_url:video.thumbnail,
        type:"video",
        url:url
    }];
    return media;
}