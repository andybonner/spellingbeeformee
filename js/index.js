if ($(window).width() >= 600) { //layout alignment based on screen size
  $("#scoreBoxes").addClass("right-align");
  $("#resetBox").addClass("left-align");
}

const spellingList = ["fit",
    "mad",
    "bus",
    "dots",
    "spy",
    "job",
    "row",
    "tree",
    "ship",
    "name",
    "ears",
    "room",
    "case",
    "meal",
    "rang",
    "tile",
    "lost",
    "aim",
    "nest",
    "tiny",
    "need",
    "darts",
    "straw",
    "maybe",
    "cried",
    "shell",
    "wash",
    "chew",
    "start",
    "first",
    "picky",
    "claws",
    "great",
    "stage",
    "open",
    "sadly",
    "brush",
    "cross",
    "hugged",
    "trail",
    "butter",
    "sharp",
    "digging",
    "soap",
    "bones",
    "small",
    "center", //or "centre"
    "lava",
    "monster",
    "bathtub",
    "ivy",
    "nose",
    "tusk",
    "road",
    "oven",
    "news",
    "food",
    "rules",
    "braid",
    "miles",
    "folds",
    "pages",
    "boring",
    "corner",
    "ferns",
    "elbow",
    "taxi",
    "stuck",
    "grain",
    "float",
    "awake",
    "bird",
    "snack",
    "wear",
    "mane",
    "hardly",
    "shirts",
    "moody",
    "lawn",
    "branch",
    "pantry",
    "sandbox",
    "posters",
    "spider",
    "coast",
    "bother",
    "mouse",
    "swift",
    "restless",
    "parents",
    "beehive",
    "shopping",
    "artwork",
    "chance",
    "lookout",
    "stroller",
    "anyone",
    "thumb",
    "backdrop",
    "fuddy-duddy",
    "paint",
    "soul",
    "banana",
    "frown",
    "temper",
    "burst",
    "hungry",
    "riddle",
    "porch",
    "silver",
    "untidy",
    "curved",
    "leaky",
    "interact",
    "sturdy",
    "chatter",
    "bakery",
    "darkest",
    "feast",
    "dollars",
    "might",
    "subject",
    "dishes",
    "partly",
    "forward",
    "strange",
    "hitched",
    "rather",
    "puzzles",
    "sign",
    "pebbles",
    "married",
    "chamber",
    "flicker",
    "onion",
    "arcade",
    "London",
    "pounce",
    "shrill",
    "mayor",
    "farewell",
    "young",
    "supplies",
    "beginning",
    "vacation",
    "skateboard",
    "poem",
    "snoozing",
    "lotion",
    "prevented",
    "smirk",
    "destiny",
    "monkeys",
    "studio",
    "nifty",
    "janitor",
    "pottery",
    "wonderful",
    "square",
    "belief",
    "contract",
    "anteater",
    "pouring",
    "lantern",
    "subtracting",
    "portable",
    "twine",
    "estate",
    "umbrella",
    "timidly",
    "observe",
    "trance",
    "elderly",
    "liquid",
    "deadline",
    "country",
    "flexible",
    "promote",
    "massive",
    "bronze",
    "climbed",
    "teaspoon",
    "balance",
    "knitting",
    "merely",
    "furnish",
    "passage",
    "complaints",
    "thunderbolt",
    "nonsense",
    "mansion",
    "laundry",
    "available",
    "lodging",
    "portions",
    "gallant",
    "veins",
    "mountain",
    "whistling",
    "voyage",
    "hooves",
    "funnel",
    "gravely",
    "hiccups", //or hiccoughs
    "performance",
    "specific",
    "dowdy",
    "indicate",
    "clause",
    "failure",
    "biology",
    "hangar",
    "quality",
    "saucepan",
    "invisible",
    "classical",
    "blurred",
    "contestants",
    "farfetched",
    "bemused",
    "clients",
    "tightrope",
    "innocent",
    "dignified",
    "priority",
    "delicate",
    "applause",
    "bargain"
  ],

  // For a few words, the Merriam-Webster API returns audio for something other than the desired word, e.g. "Gila monster" for "monster." I just hard-code them as exceptions here.
  problemList = [
    "bones",
    "monster",
    "corner",
    "stuck"
  ],

  // Booleans to be toggled if these APIs prove non-functional
  hasTTS = true,
  hasStorage = true;

if ('speechSynthesis' in window === false) {
  hasTTS = false;
  alert("I'm sorry, your browser doesn't support a text-to-speech feature, so some words will be skipped. To access all the words, try Chrome v 33 or higher, Firefox v 49 or higher,  Safari v 7 or higher, or Microsoft Edge v 38 or higher.");
}

// Words spelled wrong or skipped will be pushed to this array, and ultimately to the #studyList modal
let studyListArray = [];

if (!window.localStorage) {
  hasStorage = false;
  alert("Sorry, we can't remember which word you're on when you leave this page. The next time you come back or reload the page it will start from the beginning.");
} else if (localStorage.currentWordIndex === undefined) {
  localStorage.currentWordIndex = 0;
  localStorage.recordScore = 0;
}

if (!window.localStorage) {
  //   
} else if (localStorage.studyListArray === undefined) {
  localStorage.studyListArray = ""; //everything in storage is converted to a string
} else if (localStorage.studyListArray.length > 0) {
  studyListArray = localStorage.studyListArray.split(",");
}

// Safari in Private Browsing mode still shows localStorage as available, but sets its capacity to 0. So a check: after all that above, if the key studyListArray is still undefined, localStorage must be functionally unavailable.
if (localStorage.studyListArray === undefined) {
  hasStorage = false;
}

// Load current word and record high score from localStorage, or start them from scratch
let currentWordIndex;
if (hasStorage) {
  currentWordIndex = localStorage.currentWordIndex;
} else {
  currentWordIndex = 0;
}
let recordCount;
if (hasStorage && Number(localStorage.recordScore) >= 0) {
  recordCount = Number(localStorage.recordScore);
} else {
  recordCount = 0;
}
$("#recordScore").html(recordCount);
let word = "",
    tts,
    usingTTS = false,
    audio,
    audioURL = "",
    hintLetter = 1,
    loadaling,
    
    chip = {
  tag: 'chip content',
  id: 1, //optional
};

// Often the API takes several seconds to return, so it's possible to submit an answer and have the app move on to expect the "new" word, but the play button is still playing the "old" word. So here's a function to disable the button and give it a loading animation, to be called in updateWord() below.
function preloader() {
  $("#play").addClass("disabled").html('<div class="preloader-wrapper small active valign-wrapper"><div class="spinner-layer spinner valign"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div>');
  loadaling = true; // http://hrwiki.org/wiki/Irregular_Loading_Screens
}

// the function to re-enable the button and remove the animation is included in the "success" function of the API call
function stopLoader() {
  $("#play").removeClass("disabled").html('<i class="large material-icons">play_arrow</i>');
  loadaling = false;
}

let updateWord = function() {
  preloader();
  word = spellingList[currentWordIndex];
  localStorage.currentWordIndex = currentWordIndex;
  hintLetter = 1; // resetting the "hint" function to the beginning of the new word
}

// var settings = {
//   "async": true,
//   "crossDomain": true,
//   "url": "https://od-api.oxforddictionaries.com/api/v1/entries/en/fit/regions=us",
//   "method": "GET",
//   "headers": {
//     "accept": "application/json",
//     "app_id": "0221faad",
//     "app_key": "e4af98008c290b83307d432a537cf190",
//     "cache-control": "no-cache",
//     "postman-token": "6544e3df-d61d-2392-5dbb-e5e64f10d226"
//   }
// }

// $.ajax(settings).done(function (response) {
//   console.log(response);
// });
// Here's where the magic happens.
function getDictionary() {
  updateWord();
  usingTTS = false; // reset in case the last word made it true
  let xhr = new XMLHttpRequest();
  xhr.open("GET", "https://od-api.oxforddictionaries.com/api/v1", true);
  xhr.setRequestHeader("Accept", "application/json");
  xhr.onload =function () {
    console.log(xhr.responseText);
  };
  xhr.send();
  $.ajax({
    url: "https://od-api.oxforddictionaries.com/api/v1/entries/en/" + word + "/regions=us",
    headers: {
      "Accept": "application/json",
      "app_id": "0221faad",
      "app_key": "e4af98008c290b83307d432a537cf190"
    },
    method: "GET",
    contentType: "text/plain",
    dataType: "jsonp",
    crossDomain: "true",
    success: function(data) {
      console.log("it worked!");
      let audioFilename = $(data).find("hw:contains(" + word + ") ~ sound wav").html();
      // look through the XML response for a "<hw>" element with the desired word, with a sibling <sound> and harvest its <wav>. Cause that seems to be how the API is set up... most often. Except when it's not (gila monster!).
      console.log("wav =" + audioFilename);
      // If that doesn't yield a usable result--including if it yields a gila monster--then turn to HTML 5 SpeechSynthesis
      if (audioFilename === undefined || problemList.includes(word)) {
        if (hasTTS === false) {
          skipWord();
        } else {
          usingTTS = true;
          console.log("using TTS");
          tts = new SpeechSynthesisUtterance(word);
        }
      } else {
        let subdir = "";
        // the API specifies some edge cases for their audio directory structure
        if (audioFilename.startsWith("bix")) {
          subdir = "bix/";
        } else if (audioFilename.startsWith("gg")) {
          subdir = "gg/"
        } else if (parseInt(audioFilename.charAt(0)) === "number") {
          subdir = "number/"
        } else {
          subdir = audioFilename.charAt(0) + "/";
        }
        audioURL = "http://media.merriam-webster.com/soundc11/" + subdir + audioFilename;
        console.log(audioURL);
        audio = new Audio(audioURL);
      }
      // to generate the "example": .text() instead of .html() gets around the fact that sometimes the word itself is interrupted by tags. Unfortunately, it returns all the instances, so we have to filter by .first(). Even if the first one isn't always the best... Too bad there's no $.best().
      let sentence = $(data).find("vi:contains(" + word + ")").first().text();
      if (sentence === undefined || sentence.length < 1) {
        sentence = "sorry, unavailable";
      }
      console.log(sentence);
      $("#sentence").html("Example: " + sentence.replace(word, "_____"));
      stopLoader();
    },
    error: function() {
      alert("I'm sorry, there was an error. Try reloading?");
    }
  });
}

// increment the "right" counter
function updateRight() {
  let rightCount = $("#rightScore").html();
  rightCount++;
  $("#rightScore").html(rightCount);
}

// increment the "wrong" counter, AND push the misspelled word to the study list
function updateWrong() {
  let wrongCount = $("#wrongScore").html();
  wrongCount++;
  $("#wrongScore").html(wrongCount);
  if (studyListArray.includes(word)) {
    //do nuttin
  } else {
    studyListArray.push(word);
    localStorage.studyListArray = studyListArray;
  }
}

// increment the record high score
function updateRecord() {
  if (hasStorage) {
    recordCount = Number(localStorage.recordScore);
    recordCount++;
    localStorage.recordScore = recordCount;
  } else {
    recordCount++;
  }
  $("#recordScore").html(recordCount);
}

// function to play the audio
$("#play").click(function() {
  if (loadaling === false) {
    if (usingTTS === true) {
      window.speechSynthesis.speak(tts);
    } else {
      audio.play();
    }
    $("#responseText").focus();
  } else {
    //do nuttin
  }
});

// function to process submitted answer
$("#response").submit(function(event) {
  event.preventDefault();
  let response = $("#responseText").val();
  if (word === spellingList[spellingList.length - 1]) {
    Materialize.toast("Yay!! You made it to the end of the list! Now you can click the 'restart' button to start again at the beginning.", 4000, "rounded");
    updateRight();
    updateRecord();
  } else if (response === word) {
    Materialize.toast("That's right! You rock! Now click to hear the next word.", 4000, "rounded");
    $("#responseText").val("");
    updateRight();
    updateRecord();
    currentWordIndex++;
    getDictionary
  ();
  } else {
    Materialize.toast("Sorry, that's not right. Try again!", 4000, "rounded");
    updateWrong();
  }
});

$("#resetScore").click(function() {
  localStorage.recordScore = 0;
  recordCount = 0;
  $("#recordScore").html("0");
});

$("#hint").click(function() {
  Materialize.toast("It starts with: " + word.substring(0, hintLetter), 4000, "rounded");
  hintLetter++;
  $("#responseText").focus();
});

// I pulled out the skip function, minus the part about saving to localStorage, to let the app skip TTS words when TTS is unavailable
function skipWord() {
  currentWordIndex++;
  getDictionary
();
}

$("#skip").click(function() {
  studyListArray.push(word);
  localStorage.studyListArray = studyListArray;
  skipWord();
});

$("#restart").click(function() {
  currentWordIndex = 0;
  getDictionary
();
});

$("#random").click(function() {
  currentWordIndex = Math.floor((Math.random() * 100) + 1);
  getDictionary
();
  $('#jumpWord').modal('close');
});

// open the study list modal, and build its content
$("#study").click(function() {
  for (let i = 0, limit = studyListArray.length; i < limit; i++) {
    let studyWord = studyListArray[i];
    if (studyWord === "undefined" || studyWord.length < 1 || $("#studyListWords").find("#" + studyWord).length) {
      continue;
    } else {
      $("#studyListWords").append('<div id="' + studyWord + '" class="chip">' + studyWord + '<i class="close material-icons">close</i></div>');
    }
  }
  $('#studyList').openModal();
});

$("#jump").click(function() {
  $("#jumpWord").openModal();
});

$("#wordJumper").submit(function(event) {
  event.preventDefault();
  currentWordIndex = document.getElementById("jumpSlider").value - 1;
  console.log(currentWordIndex);
  getDictionary
();
});

$("#aboutLink").click(function() {
  $("#about").openModal();
})

// remove words from study list
$("#studyListWords").on("click", ".chip", function() {
  studyListArray.splice(studyListArray.indexOf(this.id), 1);
  localStorage.studyListArray = studyListArray;
})

// clear study list
$("#studyClear").click(function() {
  studyListArray = [];
  localStorage.studyListArray = "";
  $("#studyListWords").html("");
});

// kick it off
$(document).ready(getDictionary());

$(document).ready(function() {
  // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
  $('.modal').modal();
});

// draft of post to oxford dictionaries forum:
// I feel like I have a Stupid Beginner problem. I really want to use the OxfordDictionaries API in a spelling quiz app I'm developing for my daughter, but I'm too inexperienced with making API techniques to make the request correctly. Here's what I had at first:
// `function getDictionary() {
//   $.ajax({
//     url: "https://od-api.oxforddictionaries.com/api/v1/entries/en/" + word + "/regions=us",
//     headers: {
//       "Accept": "application/json",
//       "app_id": "my_id",
//       "app_key": "my_key"
//     },
//     method: "GET",
//     contentType: "text/plain",
//     dataType: "json",
//     success: function(data) {
//      etc}`
// As this wasn't working, I tried changing dataType to jsonp, and adding `crossDomain: "true"`, but no luck. I resolved, not for the first time, to figure out how to make a proper CORS request once and for all. [It seems](https://www.html5rocks.com/en/tutorials/cors/#toc-making-a-cors-request "It seems") I need to 