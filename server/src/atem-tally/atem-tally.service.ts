import { Injectable } from '@nestjs/common';
import { AtemService, AtemState } from 'src/atem';
import { Logger } from 'src/logger';

export interface AtemTallyState {
  inputId: number;
  longName: string;
  shortName: string;
  isPreview: boolean;
  isProgram: boolean;
}

type AtemTallyListener = (state: AtemTallyState[]) => void | Promise<void>;

@Injectable()
export class AtemTallyService {
  #tallyState: AtemTallyState[] = [];

  constructor(private logger: Logger, private service: AtemService) {}

  get tallyState() {
    return this.#tallyState;
  }

  onTallyUpdate(listener: AtemTallyListener): VoidFunction {
    console.log('registered onTallyUpdate');

    const state = this.service.state;
    this.#tallyState = this.#transformState(state);
    setImmediate(() => {
      if (this.#tallyState.length > 0) {
        listener(this.#tallyState);
      }
    });

    return this.service.onStateChange((state, paths) => {
      if (
        paths.includes('video.mixEffects.0.previewInput') ||
        paths.includes('video.mixEffects.0.programInput') ||
        paths.some((path) => path.startsWith('inputs'))
      ) {
        this.#tallyState = this.#transformState(state);
        if (this.#tallyState.length > 0) {
          listener(this.#tallyState);
        }
      }
    });
  }

  #transformState = (state: AtemState): AtemTallyState[] => {
    const tallyState = Object.values(state.inputs)
      .filter(({ meAvailability }) => meAvailability === 1)
      .map(({ inputId, longName, shortName }) => ({
        inputId,
        longName,
        shortName,
        isPreview: false,
        isProgram: false,
      }));

    const mixEffectOne = state.video.mixEffects[0];
    if (mixEffectOne === undefined) {
      return tallyState;
    }

    const { previewInput, programInput } = mixEffectOne;

    tallyState.find(({ inputId }) => inputId === previewInput).isPreview = true;
    tallyState.find(({ inputId }) => inputId === programInput).isProgram = true;

    return tallyState;
  };
}
