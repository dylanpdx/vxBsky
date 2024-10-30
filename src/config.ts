interface VxBskyConfig{
    appname:string,
    color:string,
    repo:string,
    url:string,
    imageCombineApi?:string,
    videoConvertApi?:string,
    gifConvertApi?:string,
}

const currentConfig:{config:VxBskyConfig|undefined}={config:undefined};

export default function getConfig(env?:any):VxBskyConfig{
    if (currentConfig.config){
        return currentConfig.config;
    }
    currentConfig.config = {
        appname:env.APPNAME || "vxBsky",
        color:env.COLOR || "#208bfe",
        repo:env.REPO || "https://github.com/dylanpdx/vxBsky",
        url:env.URL || "https://vxbsky.app",
        imageCombineApi:env.IMAGE_COMBINE_API,
        videoConvertApi:env.VIDEO_CONVERT_API,
        gifConvertApi:env.GIF_CONVERT_API,
    }
    return currentConfig.config;
}