import { Injectable } from '@nestjs/common';
import { Atem, AtemConnectionStatus, AtemState } from 'atem-connection';
import { Logger } from 'src/logger';

export type { AtemState };

type AtemConnectionListener = (isConnected: boolean) => void | Promise<void>;
type AtemStateListener = (
  state: AtemState,
  changedPath: string[],
) => void | Promise<void>;

@Injectable()
export class AtemService {
  private readonly atem = new Atem({ childProcessTimeout: 100 });
  #lastTime: string;

  constructor(private logger: Logger) {
    this.atem.on('error', (error) => {
      this.logger.error('ATEM ERROR occured', error);
    });
    this.atem.on('stateChanged', (state: AtemState) => {
      const { hour, minute, second, frame } = state.info.lastTime;
      this.#lastTime = `${hour}:${minute}:${second}.${frame}`;
    });
  }

  async connect({ ip }: { ip: string }): Promise<void> {
    if (this.connected) {
      return;
    }

    await new Promise<void>((resolve) => {
      this.atem.once('connected', resolve);
      this.atem.connect(ip);
    });
    await this.atem.requestTime();
  }

  get lastTime() {
    return this.#lastTime;
  }

  get state() {
    return this.atem.state;
  }

  get connected() {
    return this.atem.status === AtemConnectionStatus.CONNECTED;
  }

  onConnectionChange(listener: AtemConnectionListener): VoidFunction {
    const connectedListener = () => listener(true);
    const disconnectedListener = () => listener(false);

    this.atem.on('connected', connectedListener);
    this.atem.on('disconnected', disconnectedListener);

    return () => {
      this.atem.off('connected', connectedListener);
      this.atem.off('disconnected', disconnectedListener);
    };
  }

  onStateChange(listener: AtemStateListener): VoidFunction {
    this.atem.on('stateChanged', listener);
    return () => this.atem.off('stateChanged', listener);
  }

  selectInput(input: number) {
    return this.atem.changePreviewInput(input);
  }

  cut() {
    return this.atem.cut();
  }

  async autoTransition() {
    await this.atem.autoTransition();
    await new Promise<void>((resolve) => {
      const listener = (state: AtemState, path) => {
        if (
          path.includes('video.mixEffects.0.transitionPosition') &&
          state.video.mixEffects[0].transitionPosition.remainingFrames === 0
        ) {
          resolve();
          this.atem.off('stateChanged', listener);
        }
      };
      this.atem.on('stateChanged', listener);
    });
  }
}
