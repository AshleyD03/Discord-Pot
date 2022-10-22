/**
 * This class represents a queue of songs that are being played 1 at a time
 * on a discord server {@link PlayerSession}.
 */
export class SongQueue {
  private _songs: Song[] = [];

  constructor() {}

  /**
   * Add a song to the queue
   * @param song a song the bot can play
   */
  public enque(song: Song) {
    this._songs.push(song);
  }

  /**
   * Remove and return the next song in the queue
   * @returns the next song
   */
  public deque() {
    return this._songs.shift();
  }

  /**
   * Return the next song to {@link deque}.
   * This doesn't remove it from the queue.
   * @returns the next song
   */
  public peek() {
    return this._songs[0];
  }

  /**
   * A list containing all the songs in the queue.
   * @returns a list of songs
   */
  public list() {
    return this._songs;
  }

  public moveTo(index: number) {
    if (index < 1 || index >= this._songs.length) return false;
    this._songs.splice(0, index);
    return true;
  }
}
