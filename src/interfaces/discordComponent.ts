export interface DiscordComponent{
    type:number,
    components?:DiscordComponent[],
    [others: string]: any; // i will eventually make a proper type
}