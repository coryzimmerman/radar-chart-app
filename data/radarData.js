// data/radarData.js

const radarData = [
  {
    name: "Baseline",
    data: [
      { axis: "Thematic Units", value: 2 },
      { axis: "Session Structure", value: 4 },
      { axis: "Evidence-Backed Strategies", value: 7 },
      { axis: "Paperwork", value: 7 },
      { axis: "Data Collection", value: 6 },
      { axis: "Therapy Planning", value: 6 },
      { axis: "Individual Growth", value: 7 },
      { axis: "School Collaboration", value: 5 },
      { axis: "Community Impact", value: 5 },
    ],
  },
  {
    name: "Previous",
    data: [
      { axis: "Thematic Units", value: 5 },
      { axis: "Session Structure", value: 6 },
      { axis: "Evidence-Backed Strategies", value: 6 },
      { axis: "Paperwork", value: 6 },
      { axis: "Data Collection", value: 7 },
      { axis: "Therapy Planning", value: 7 },
      { axis: "Individual Growth", value: 8 },
      { axis: "School Collaboration", value: 6 },
      { axis: "Community Impact", value: 7 },
    ],
  },
  {
    name: "Current",
    data: [
      { axis: "Thematic Units", value: 7 },
      { axis: "Session Structure", value: 8 },
      { axis: "Evidence-Backed Strategies", value: 8 },
      { axis: "Paperwork", value: 7 },
      { axis: "Data Collection", value: 8 },
      { axis: "Therapy Planning", value: 8 },
      { axis: "Individual Growth", value: 8 },
      { axis: "School Collaboration", value: 7 },
      { axis: "Community Impact", value: 7 },
    ],
  },
];

export default radarData;

export const pillars = [
  {
    name: "Powerful Practice",
    color: "#F3467C",
    sections: [
      { name: "Thematic Units" },
      { name: "Session Structure" },
      { name: "Evidence-Backed Strategies" },
    ],
  },
  {
    name: "Streamlined Systems",
    color: "#00ADBB",
    sections: [
      { name: "Paperwork" },
      { name: "Data Collection" },
      { name: "Therapy Planning" },
    ],
  },
  {
    name: "Intentional Growth",
    color: "#FFC728",
    sections: [
      { name: "Individual Growth" },
      { name: "School Collaboration" },
      { name: "Community Impact" },
    ],
  },
];

export const pillarColors = {
  "Powerful Practice": "#F3467C",
  "Streamlined Systems": "#00ADBB",
  "Intentional Growth": "#FFC728",
};

export const questionToPillar = {
  "Thematic Units": "Powerful Practice",
  "Session Structure": "Powerful Practice",
  "Evidence-Backed Strategies": "Powerful Practice",
  Paperwork: "Streamlined Systems",
  "Data Collection": "Streamlined Systems",
  "Therapy Planning": "Streamlined Systems",
  "Individual Growth": "Intentional Growth",
  "School Collaboration": "Intentional Growth",
  "Community Impact": "Intentional Growth",
};
