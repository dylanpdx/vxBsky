import base64
import os
import subprocess
import tempfile
import hashlib

def usingS3():
    return os.getenv('USE_S3') == 'true'

def redir(url):
    return {
        "statusCode": 307,
        "headers": {
            "Location": url
        }
    }

if usingS3():
    import boto3
    s3 = boto3.client('s3',endpoint_url=os.getenv('CF_ENDPOINT'),aws_access_key_id=os.getenv('CF_KEY'),aws_secret_access_key=os.getenv('CF_KEY_SECRET'))
    bucketname="vxbsky-renders"

def fileExistsInS3(filename):
    try:
        s3.head_object(Bucket=bucketname, Key=filename)
        return True
    except:
        return False

def lambda_handler(event, context):
    
    url = "https://video.bsky.app"+event['requestContext']['http']['path']
    urlHash = hashlib.sha256(url.encode()).hexdigest()
    if not url.endswith(".m3u8"):
        url = url + ".m3u8"


    if "queryStringParameters" in event and "session_id" in event["queryStringParameters"]:
        url = url + "?session_id=" + event["queryStringParameters"]["session_id"]


    filename = urlHash+".mp4"

    if usingS3() and fileExistsInS3(filename):
        return redir(f"https://video.vxbsky.app/{filename}")

    # download video
    videoLocation = tempfile.mkstemp(suffix=".mp4")[1]
    # ffmpeg -i url -vcodec copy -acodec copy out.mp4
    cmd=["ffmpeg",'-http_persistent','0',"-i",f'{url}','-vcodec','copy','-acodec','copy','-y',videoLocation]
    out = subprocess.check_output(cmd)
    print(out)
    
    with open(videoLocation, "rb") as image_file:
        if not usingS3():
            encoded_string = base64.b64encode(image_file.read()).decode('ascii')
            os.remove(videoLocation)
            print("Returning video")
            return {
                'statusCode': 200,
                "headers": 
                {
                    "Content-Type": "video/mp4"
                },
                'body': encoded_string,
                'isBase64Encoded': True
            }
        else:
            # upload to s3
            print("Uploading to S3")
            s3.upload_fileobj(image_file, bucketname, filename)
            os.remove(videoLocation)
            return redir(f"https://video.vxbsky.app/{filename}")