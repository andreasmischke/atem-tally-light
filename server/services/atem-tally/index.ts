import { Logger } from "../logger";
import { AtemService, AtemState } from "../atem";

export interface AtemTallyState {
  inputNumber: number;
  isPreview: boolean;
  isProgram: boolean;
}

type AtemTallyListener = (state: AtemTallyState[]) => void | Promise<void>;

export class AtemTallyService {
  #service: AtemService;
  #logger: Logger;
  #tallyState: AtemTallyState[];

  constructor({
    logger,
    atemService,
  }: {
    atemService: AtemService;
    logger: Logger;
  }) {
    this.#service = atemService;
    this.#logger = logger;

    const initialState = this.#service.state;
    this.#tallyState =
      initialState === undefined
        ? this.#createEmptyTallyState(4)
        : this.#transformState(initialState);
  }

  get tallyState() {
    return this.#tallyState;
  }

  onTallyUpdate(listener: AtemTallyListener): VoidFunction {
    return this.#service.onStateChange((state) => {
      this.#tallyState = this.#transformState(state);
      listener(this.#tallyState);
    });
  }

  #createEmptyTallyState = (count = 4): AtemTallyState[] => {
    let state = [];
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
