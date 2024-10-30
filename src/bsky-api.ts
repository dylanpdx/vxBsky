import { BskyAgent } from "@atproto/api";

export const agent = new BskyAgent({service: "https://api.bsky.app",});

export async function getUser(user:string){
  const { data: userData } = await agent.getProfile({
    actor: user,
  });
  return userData;
}

export async function getPostFromUri(uri:string){
  const posts = await agent.getPosts({uris:[uri]});
  return posts.data.posts[0];
}

export async function getPost(user:string,id:string){
  const userData = await getUser(user);
  const uri = `at://${userData.did}/app.bsky.feed.post/${id}`;
  return await getPostFromUri(uri);
}

