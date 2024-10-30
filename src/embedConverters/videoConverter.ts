import { AppBskyEmbedVideo } from "@atproto/api";
import { VideoMedia } from "../interfaces/extendedMedia";
import { parse, types, stringify } from 'hls-parser';
import zlib from 'zlib';
import { promisify } from 'util';
import getConfig from "../config";
const gzip = promisify(zlib.gzip);

export default async function ConvertVideo(video:AppBskyEmbedVideo.View) : Promise<VideoMedia[]>{
    const config = getConfig();

    if (!config.videoConvertApi){
        return [];
    }

    // logic to get video url from m3u8
    const m3u8 = await fetch(video.playlist).then((res)=>res.text());
    // yes, I know the m3u8's bsky serves are very simple and I could parse them myself
    const parsedData = parse(m3u8) as types.MasterPlaylist;

    const hdVideoM3u8 = parsedData.variants.reduce((prev, current) => (prev.bandwidth > current.bandwidth) ? prev : current);
    const hdUri = video.playlist.replace(/[^/]*$/, hdVideoM3u8.uri);

    // pass it to somewhere where we can call the following:
    // ffmpeg -i $hdUri -vcodec copy -acodec copy out.mp4
    const apiUrl = hdUri.replace("https://video.bsky.app",config.videoConvertApi).replace(".m3u8","");

    const media:VideoMedia[] = [
    {
        altText:video.alt,
        size:{width:video.aspectRatio?.width as number,height:video.aspectRatio?.height as number},
        thumbnail_url:video.thumbnail,
        type:"video",
        url:apiUrl
    }];
    return media;
}