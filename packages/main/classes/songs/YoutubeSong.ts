import { Readable } from "stream";
import ytdl from "ytdl-core";

/**
 * This represent all the data around a video that you can play from youtube.
 * It requires a video's url to be constructed and fetches other data required to
 * fulfil the {@link Song} interface.
 */
export class YoutubeSong implements Song {
  public url: string;
  public ownerId: string;
  public title: string = "";

  private _info?: ytdl.videoInfo;
  private __infoPromise?: Promise<ytdl.videoInfo>;
  private _valid: boolean = false;

  constructor(url: string, ownerId: string) {
    this.url = url;
    this.ownerId = ownerId;

    this._valid = ytdl.validateURL(url);
    if (!this.isValid()) return;

    this.refreshInfo();
  }

  /**
   * Check if the video is valid
   * @returns true if valid, else false
   */
  public isValid(): boolean {
    return !!this._valid;
  }

  public isYoutube() {
    return true;
  }

  /**
   * Get a {@link Readable} stream for the youtube video
   * @returns a {@link Readable} stream of the youtube video
   */
  public getStream(): Readable | undefined {
    if (this.isValid()) return ytdl(this.url);
  }

  /**
   * Get the {@link SongDetails} for this song.
   * This is useful for providing information to users.
   * @returns the details about this song
   */
  public async getDetails(): Promise<SongDetails> {
    if (!this.__infoPromise) {
      this.__infoPromise = this.refreshInfo();
    }
    const info = await this.__infoPromise;
    const details = info.videoDetails;
    return {
      url: this.url,
      title: this.title,
      lengthString: this.secondsToString(parseInt(details.lengthSeconds)),
      lengthSeconds: parseInt(details.lengthSeconds),
      authorName: details.author.name,
      ytdlVideoInfo: info ,
      isValid: this.isValid(),
      description: details.description || "",
      ownerId: this.ownerId,
    };
  }

  /**
   * Request {@link ytdl} for the info relating to this song and update:
   * {@link this._info}, {@link this.title} and {@link this.__infoPromise}.
   */
  private async refreshInfo(): Promise<ytdl.videoInfo> {
    this.__infoPromise = ytdl.getInfo(this.url);
    this.__infoPromise.then((info) => {
      this._info = info;
      this.title = info.videoDetails.title;
    });
    return this.__infoPromise;
  }

  /**
   * Create a text formatted version from an ammount of seconds.
   * It is formatted "...H:MM:SS" and if there is no value for H it is ignored.
   * @param seconds the time to be formatted
   * @returns a string in "...H:MM:SS" 
   */
  private secondsToString(seconds: number): string {
    let hour = Math.floor(seconds / 3600).toString()  + ':'
    let minutes = (Math.floor(seconds / 60) % 60).toString()  + ':'
    let secs = (seconds % 60).toString()

    if (hour.length < 3) hour = '0' + hour
    if (minutes.length < 3) minutes = '0' + minutes
    if (secs.length < 2) secs = '0' + secs

    if (hour === '00:') hour = '';
    return hour + minutes + secs
  }
}
