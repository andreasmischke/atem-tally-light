import { TallyState } from "../tally-light-client/TallyLightClient";

export const tallies: TallyState[] = [
  {
    inputId: 1,
    isPreview: true,
    isProgram: false,
    longName: "Camera 1",
    shortName: "CAM 1",
    selected: true,
  },
  {
    inputId: 2,
    isPreview: false,
    isProgram: true,
    longName: "Camera 2",
    shortName: "CAM 2",
    selected: true,
  },
  {
    inputId: 3,
    isPreview: false,
    isProgram: false,
    longName: "Camera 3",
    shortName: "CAM 3",
    selected: true,
  },
  {
    inputId: 4,
    isPreview: false,
    isProgram: false,
    longName: "Camera 4",
    shortName: "CAM 4",
    selected: true,
  },
];
