import { Logger } from "../logger";
import { AtemService, AtemState } from "../atem";

export interface AtemTallyState {
  inputNumber: number;
  isPreview: boolean;
  isProgram: boolean;
}

function createEmptyTallyState(count = 4): AtemTallyState[] {
  return new Array(count).map((value, index) => ({
    inputNumber: index + 1,
    isPreview: false,
    isProgram: false,
  }))
}

const initialTallyState = createEmptyTallyState(4)

type AtemTallyListener = (state: AtemTallyState[]) => void | Promise<void>;

export class AtemTallyService {
  #service: AtemService;
  #logger: Logger;
  #tallyState: AtemTallyState[] = initialTallyState;

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
        ? initialTallyState
        : this.#transformState(initialState);
  }

  get tallyState() {
    return this.#tallyState;
  }

  #transformState = (state: AtemState): AtemTallyState[] => {
    const tallyState = createEmptyTallyState(4);

    const mixEffectOne = state.video.mixEffects[0];
    if (mixEffectOne === undefined) {
      return tallyState;
    }

    const { previewInput, programInput } = mixEffectOne;

    tallyState[previewInput - 1].isPreview = true;
    tallyState[programInput - 1].isProgram = true;

    return tallyState;
  }

  onTallyUpdate(listener: AtemTallyListener): VoidFunction {
    return this.#service.onStateChange((state) => {
      this.#tallyState = this.#transformState(state);
      listener(this.#tallyState);
    });
  }
}
