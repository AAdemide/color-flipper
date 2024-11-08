const colours = [
  { Colour: "#ff80ed", Name: "Hottest Of Pinks" },
  { Colour: "#065535", Name: "" },
  { Colour: "#133337", Name: "Elite Teal" },
  { Colour: "#ffc0cb", Name: "Pink" },
  { Colour: "#ffe4e1", Name: "MistyRose1" },
  { Colour: "#008080", Name: "Teal" },
  { Colour: "#ff0000", Name: "Red1" },
  { Colour: "#e6e6fa", Name: "Lavender" },
  { Colour: "#ffd700", Name: "Gold1" },
  { Colour: "#00FFFF", Name: "Aqua" },
  { Colour: "#ffa500", Name: "Orange1" },
  { Colour: "#0000ff", Name: "Blue1" },
  { Colour: "#c6e2ff", Name: "SlateGray1" },
  { Colour: "#b0e0e6", Name: "PowderBlue" },
  { Colour: "#40e0d0", Name: "Turquoise" },
  { Colour: "#ff7373", Name: "" },
  { Colour: "#d3ffce", Name: "" },
  { Colour: "#f0f8ff", Name: "AliceBlue" },
  { Colour: "#666666", Name: "Gray40" },
  { Colour: "#faebd7", Name: "AntiqueWhite" },
  { Colour: "#ff00ff", Name: "Magenta" },
  { Colour: "#00ff00", Name: "Green1" },
];
let state = false;
const modes = [
  "monochrome",
  "monochrome-dark",
  "monochrome-light",
  "analogic",
  "complement",
  "analogic-complement",
  "triad",
  "quad",
];
const colorCacheSize = 80;
let colorCache = Array.from({ length: colorCacheSize }, () => {});
let cacheCounter = 0; //index of the last color in counter
let coloursI = 0; //coloursIndex
let colour = colours[coloursI]; //currentColour
let fetchedData; //stores the fetched data
let bgState = false;
let fetchedColors = [];

//utility function that return a random element from an array
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
//copied from: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
const shuffleArray = (arr) => {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
};
//utility function converts hex color to RGB
const hexToRGB = (hex) => {
  const rgb = [0, 0, 0];
  rgb[0] = parseInt(hex.substring(1, 3), 16);
  rgb[1] = parseInt(hex.substring(3, 5), 16);
  rgb[2] = parseInt(hex.substring(5), 16);

  return rgb;
};

//https://juicystudio.com/article/luminositycontrastratioalgorithm.php
//https://stackoverflow.com/questions/1331591/given-a-background-color-black-or-white-text
//This whole function calculates contrast of bg color to decide if black or white text is best
const contrastCalcYIQ = (hex) => {
  const [r, g, b] = hexToRGB(hex);
  const yiq = (r * 299 + g * 587 + b * 144) / 1000;

  return yiq >= 128 ? true : false;
};

const simpleOnclick = () => {
  state = false;
  document.getElementById("simpleLink").classList.add("activeLink");
  document.getElementById("hexLink").classList.remove("activeLink");
  document.getElementById("modesSelect").style.display = "none";
};
const hexOnclick = () => {
  try {
    state = true;
    document.getElementById("simpleLink").classList.remove("activeLink");
    document.getElementById("hexLink").classList.add("activeLink");
    document.getElementById("modesSelect").style.display = "inline";
    fetchColorScheme("all").then(() => {
      //shuffle array 10 times for good measure
      for (let index = 0; index < 10; index++) {
        shuffleArray(colorCache); 
      }
      cbOnClick();
    });
    
  } catch (error) {
    console.log("hexOnClick: ", error);
  }
};
const selectOnChange = (e) => {
  
  fetchColorScheme(e.target.value).then(() => {
    cbOnClick();
  });
}


const fetchColorScheme = async (mode) => {
  colorCache = Array.from({ length: colorCacheSize }, () => {});
  cacheCounter = 0;
  const getURL = () =>
    `https://www.thecolorapi.com/scheme?hex=${getRandomElement(
      colours
    ).Colour.slice(1)}&mode=${mode}&count=80`;
  const getURLAll = (i) =>
    `https://www.thecolorapi.com/scheme?hex=${getRandomElement(
      colours
    ).Colour.slice(1)}&mode=${modes[i]}&count=10`;

  if(mode != "all") {
    const url = getURL()
    console.log("fetched with this URL: ", url)
    return fetch(url)
    .then((res) => res.json())
    .then((data) => {
      data.colors.forEach((col) => {
        colorCache[cacheCounter] = {
          Colour: col.hex.value,
          Name: col.name.value,
        };
        cacheCounter = (cacheCounter+1)%colorCacheSize;
      });
    })
  }
  return Promise.all(
    Array.from({ length: 8 }, (_, i) =>
      fetch(getURLAll(i))
        .then((res) => res.json())
        .then((data) => {
          data.colors.forEach((col) => {
            colorCache[cacheCounter] = {
              Colour: col.hex.value,
              Name: col.name.value,
            };
            cacheCounter = (cacheCounter+1)%colorCacheSize;
          });
        })
    )
  );
};
//function handles re-rendering of app
const changeBG = () => {
  bgState = contrastCalcYIQ(colour.Colour);
  if (bgState) {
    document.body.style.setProperty("--my-color1", "#000");
    document.getElementById("heading").style.setProperty("--my-color2", "#FFF");
    document.getElementById("nav").style.setProperty("--my-color2", "#FFF");
  } else {
    document.body.style.setProperty("--my-color1", "#FFF");
    document.getElementById("heading").style.setProperty("--my-color2", "#000");
    document.getElementById("nav").style.setProperty("--my-color2", "#000");
  }

  document.body.style.backgroundColor = colour.Colour;
  document.getElementById("colour").textContent = `${colour.Colour}`;
  document.getElementById("colour").style.color = colour.Colour;
  document.getElementById("colourName").textContent = `${colour.Name}`;
};
//handle the click of the change button
const cbOnClick = () => {
  if (!state) {
    coloursI = (coloursI + 1) % colours.length;
    colour = colours[coloursI];
    changeBG();
  } else if (state) {
    coloursI = (coloursI + 1) % colorCacheSize;
    colour = colorCache[coloursI];
    changeBG();
  }
};
