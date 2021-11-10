import { Injectable } from '@nestjs/common';
import { AtemService, AtemState } from 'src/atem';
import { Logger } from 'src/logger';

export interface AtemTallyState {
  inputNumber: number;
  isPreview: boolean;
  isProgram: boolean;
}

type AtemTallyListener = (state: AtemTallyState[]) => void | Promise<void>;

@Injectable()
export class AtemTallyService {
  #tallyState: AtemTallyState[];

  constructor(private logger: Logger, private service: AtemService) {
    const initialState = this.service.state;
    this.#tallyState =
      initialState === undefined
        ? this.#createEmptyTallyState(4)
        : this.#transformState(initialState);
  }

  get tallyState() {
    return this.#tallyState;
  }

  onTallyUpdate(listener: AtemTallyListener): VoidFunction {
    console.log('registered onTallyUpdate');

    return this.service.onStateChange((state) => {
      this.#tallyState = this.#transformState(state);
      listener(this.#tallyState);
    });
  }

  #createEmptyTallyState = (count = 4): AtemTallyState[] => {
    const state = [];
    for (let inputNumber = 1; inputNumber <= count; inputNumber++) {
      state.push({
        inputNumber,
        isPreview: false,
        isProgram: false,
      });
    }
    return state;
  };

  #transformState = (state: AtemState): AtemTallyState[] => {
    const tallyState = this.#createEmptyTallyState(4);

    const mixEffectOne = state.video.mixEffects[0];
    if (mixEffectOne === undefined) {
      return tallyState;
    }

    const { previewInput, programInput } = mixEffectOne;

    tallyState[previewInput - 1].isPreview = true;
    tallyState[programInput - 1].isProgram = true;

    return tallyState;
  };
}
