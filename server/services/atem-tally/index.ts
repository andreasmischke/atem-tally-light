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
  private service: AtemService;
  private logger: Logger;
  private _tallyState: AtemTallyState[] = initialTallyState;

  public constructor({
    logger,
    atemService,
  }: {
    atemService: AtemService;
    logger: Logger;
  }) {
    this.service = atemService;
    this.logger = logger;

    const initialState = this.service.state;
    this._tallyState =
      initialState === undefined
        ? initialTallyState
        : this.transformState(initialState);
  }

  public get tallyState() {
    return this._tallyState;
  }

  private transformState(state: AtemState): AtemTallyState[] {
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

  public onTallyUpdate(listener: AtemTallyListener): VoidFunction {
    return this.service.onStateChange((state) => {
      this._tallyState = this.transformState(state);
      listener(this._tallyState);
    });
  }
}
