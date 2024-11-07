// data/radarData.js

const radarData = [
  {
    name: "Q1 2024",
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
    name: "Q2 2024",
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
    name: "Q3 2024",
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

export let userResponses = []; // Initialize an array to store user responses
