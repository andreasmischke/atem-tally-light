import { AtemService, AtemState } from "./AtemService";

export interface AtemTallyState {
  inputNumber: number;
  isPreview: boolean;
  isProgram: boolean;
}
export type AtemQuadTallyState = [
  AtemTallyState,
  AtemTallyState,
  AtemTallyState,
  AtemTallyState
];

const initialQuadTallyState: AtemQuadTallyState = [
  {
    inputNumber: 1,
    isPreview: false,
    isProgram: false,
  },
  {
    inputNumber: 2,
    isPreview: false,
    isProgram: false,
  },
  {
    inputNumber: 3,
    isPreview: false,
    isProgram: false,
  },
  {
    inputNumber: 4,
    isPreview: false,
    isProgram: false,
  },
];

type AtemTallyListener = (state: AtemQuadTallyState) => void | Promise<void>;

export class AtemTallyService {
  private service: AtemService;
  private _tallyState: AtemQuadTallyState = initialQuadTallyState;

  public constructor({ atemService }: { atemService: AtemService }) {
    this.service = atemService;

    const initialState = this.service.state;
    this._tallyState =
      initialState === undefined
        ? initialQuadTallyState
        : this.transformState(initialState);
  }

  public get tallyState() {
    return this._tallyState;
  }

  private transformState(state: AtemState): AtemQuadTallyState {
    const quadTallyState: AtemQuadTallyState = [
      {
        ...initialQuadTallyState[0],
      },
      {
        ...initialQuadTallyState[1],
      },
      {
        ...initialQuadTallyState[2],
      },
      {
        ...initialQuadTallyState[3],
      },
    ];

    const mixEffectOne = state.video.mixEffects[0];
    if (mixEffectOne === undefined) {
      return quadTallyState;
    }

    const { previewInput, programInput } = mixEffectOne;

    quadTallyState[previewInput - 1].isPreview = true;
    quadTallyState[programInput - 1].isProgram = true;

    return quadTallyState;
  }

  public onTallyUpdate(listener: AtemTallyListener): VoidFunction {
    return this.service.onStateChange((state) => {
      const quadTallyState = this.transformState(state);
      this._tallyState = quadTallyState;
      listener(quadTallyState);
    });
  }
}
