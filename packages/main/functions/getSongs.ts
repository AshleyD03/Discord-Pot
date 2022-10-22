import ytdl from "ytdl-core";
import ytpl from "ytpl";
import { YoutubeSong } from "../classes/songs/YoutubeSong";
import types from "../global";
import { Readable } from "stream";
import ytsr from "ytsr";


/**
 * Provided a url, scrape to see if it's valid to generate any {@link Song}s with.
 * @param url the url
 * @returns an array containg all the {@link Song}s that could be found
 */
export async function getSongs (url: string, ownerId: string): Promise<Song[]>  {
  
  /**
   * 1. Check if url is a youtube video
   */
  if (ytdl.validateURL(url)) {
    return [new YoutubeSong(url, ownerId)];
  }

  /**
   * 2. Check if url is a youtube playlist
   */
  const playlistID = await ytpl.getPlaylistID(url).catch((err) => null);
  if (playlistID && ytpl.validateID(playlistID)) {
    const searchResult = await ytpl(playlistID);
    return searchResult.items.map((songUrl) => new YoutubeSong(songUrl.url, ownerId));
  }

  /**
   * 3. Search youtube with url to find closest response
   */
  const searchResult = await ytsr(url).catch((err) => null);
  if (searchResult && searchResult.items.length > 0) {
    let i = 0;
    let item: ytsr.Item;
    do {
      item = searchResult.items[i];
      i++;
    } while (
      i <= searchResult.items.length &&
      item.type !== "video" &&
      item.type !== "playlist"
    );
    if (item.type === "video" || item.type === "playlist")
      return getSongs(item.url, ownerId);
  }

  return [];
};
