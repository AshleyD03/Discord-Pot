import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  joinVoiceChannel,
  NoSubscriberBehavior,
  VoiceConnection,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { SongQueue } from "./SongQueue";
import ytdl from "ytdl-core";
import { BaseGuildVoiceChannel } from "discord.js";
import { Bot } from "./Bot";

/**
 * This class respresents the audio player session that is running when a bot joins a voice call.
 * It takes account for the current song queue, the current song and the {@link AudioPlayer} streaming it.
 */
export class AudioPlayerSession {
  public queue: SongQueue;
  public player: AudioPlayer;
  public connection?: VoiceConnection;
  public currentSong?: Song;
  public guildId: string;
  public channel: BaseGuildVoiceChannel;
  public bot: Bot;

  private _paused: boolean = false;

  /**
   * Initialise a new {@link AudioPlayerSession}.
   * @param channel the channel the session will first play on
   */
  constructor(channel: BaseGuildVoiceChannel, bot: Bot) {
    this.bot = bot;
    this.guildId = channel.guildId;
    this.queue = new SongQueue();
    this.channel = channel;

    /**
     * Create audio player.
     */
    this.player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
      },
    });

    /**
     * Listen for when a song finishes playing to attempt to play next one.
     */
    this.player.on(AudioPlayerStatus.Idle, () => {
      console.log('next song')
      this.playNextSong();
    });

    /**
     * Listen for errors in player.
     */
    this.player.on("error", (error) => console.error(error));

    /**
     * Finally initialise a voice connection.
     * This is done after the player is initialised, so it can subscribe the player to
     * the new connection.
     */
    this.connectToChannel(channel);
  }

  /**
   * Have the session connect to a voice channel.
   * This method should handle all events that must be added to the voice
   * @param channel the channel attempting to be joined
   * @returns the new {@link VoiceConnection}
   */
  public async connectToChannel(
    channel: BaseGuildVoiceChannel
  ): Promise<VoiceConnection | undefined> {
    const oldConnection = this.connection;

    // Check if already connected to that channel
    if (oldConnection && oldConnection.joinConfig.channelId === channel.id)
      return;

    // Update channel
    this.channel = channel;

    // Create new connection
    this.connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guildId,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    // Subscribe player
    this.connection.subscribe(this.player);

    // Add listener for when connection is destroyed to destroy this
    this.connection.on(VoiceConnectionStatus.Destroyed, () => this.destroy());

    return this.connection;
  }

  /**
   * Attempt to play the next song in the {@link this.queue}.
   * @returns true if an audio stream is being played, else false
   */
  public playNextSong(): boolean {
    this.player.stop();
    this.currentSong = this.queue.deque();
    if (!this.currentSong) return false;

    const stream = this.currentSong.getStream();
    if (!stream) return false;

    const resource = createAudioResource(stream);
    this.player.play(resource);
    return true;
  }

  /**
   * Add a song to the queue. If no song is currently playing, play it.
   * @param song the song to add
   */
  public addSong(song: Song) {
    this.queue.enque(song);
    if (!this.currentSong) this.playNextSong();
  }

  /**
   * Destroy this session.
   * This attempts a clean-up incase garbage collecter doesn't take all
   */
  private destroy() {
    this.player.stop();
    this.player.removeAllListeners();
    this.bot.removeAudioPlayerSession(this.guildId);
  }

  /**
   * Attempt to pause the {@link player}.
   * @returns the current status of {@link this._paused}
   */
  public pause() {
    const result = this.player.pause()
    this._paused = result;
    return result;
  }

  /**
   * Attempt to unpause the {@link player}.
   * @returns the current status of {@link this._paused}
   */
  public unpause() {
    const result = this.player.unpause()
    this._paused = !result;
    return result;
  }

  /**
   * Attempt to pause/unpause the {@link player} to it's other state.
   * @returns the current status of {@link this._paused}
   */
  public togglePause() {
    return (this._paused) ? this.unpause() : this.pause();
  }

  /**
   * Check if the session's {@link VoiceConnection} is connected.
   * @returns if connected returns the {@link VoiceConnection}, else undefined
   */
  public isConnected(): VoiceConnection | undefined {
    return (
      this.connection &&
      this.connection.state.status !== "disconnected" &&
      this.connection.state.status !== "destroyed"
    ) ? this.connection : undefined
  }

  /**
   * Get the {@link BaseGuildVoiceChannel} the bot is currently connected to.
   * @returns a voice channel
   */
  public getChannel(): BaseGuildVoiceChannel {
    return this.channel
  }

  public getCurrentSong(): Song | undefined {
    return this.currentSong;
  }

  public getQueue(): SongQueue {
    return this.queue;
  }
}
