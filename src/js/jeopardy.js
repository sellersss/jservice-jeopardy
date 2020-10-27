// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];
const API_URL = 'https://jservice.io/api/';

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
  try {
    // { "id": 1111, "title": "mixed bag", "clues_count": 5}
    let res = await axios.get(`${API_URL}categories?count=100`);
    let catIds = _.shuffle(res.data.map((cat) => cat.id));

    // lodash ._sampleSize() method returns a random specified num of elements in an array
    return _.sampleSize(catIds, 6);
  } catch (e) {
    console.error(e);
  }
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
  try {
    let res = await axios.get(`${API_URL}category?id=${catId}`);
    let clues = res.data.clues;
    let sampleClues = _.sampleSize(clues, 5);
    let clue = sampleClues.map((cat) => ({
      question: cat.question,
      answer: cat.answer,
      showing: null,
    }));

    return { title: res.data.title, clue };
  } catch (e) {
    console.error(e);
  }
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
  $('#jeopardy thead').empty();
  let $row = $('<tr>');
  for (let catIndex = 0; catIndex < 6; catIndex++) {
    $row.append($('<th>').text(categories[catIndex].title));
  }
  $('#jeopardy thead').append($row);

  $('#jeopardy tbody').empty();
  for (let clueIndex = 0; clueIndex < 5; clueIndex++) {
    let $row = $('<tr>');
    for (let catIndex = 0; catIndex < 6; catIndex++) {
      $row.append($('<td>').attr('id', `${catIndex}-${clueIndex}`).text('?'));
    }
    $('#jeopardy tbody').append($row);
  }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(e) {
  let id = e.target.id;
  let [catId, clueId] = id.split('-');
  let clue = categories[catId].clue[clueId];

  if (!clue.showing) {
    msg = clue.question;
    clue.showing = 'question';
  } else if (clue.showing === 'question') {
    msg = clue.answer;
    clue.showing = 'answer';
  } else {
    return;
  }

  $(`#${catId}-${clueId}`).html(msg);
}

/** Loading button */

// function showLoadingView() {
//   $('#restart').click(function () {
//     $(this).addClass('btn--loading');
//     setTimeout(() => {
//       $(this).removeClass('btn--loading');
//     }, 2000);
//   });
// }

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  let catIds = await getCategoryIds();
  categories = [];

  for (let catId of catIds) {
    categories.push(await getCategory(catId));
  }

  fillTable();
}

/** On click of start / restart button, set up game. */

$('#restart').click(function () {
  $(this).addClass('btn--loading');
  setTimeout(() => {
    $(this).removeClass('btn--loading');
  }, 2000);
  $('table #jeopardy').hide();
  setTimeout(function () {
    setupAndStart();
  }, 1500);
});

/** On page load, add event handler for clicking clues */

$(async function () {
  setupAndStart();
  $('#jeopardy').on('click', 'td', handleClick);
});

// restart menu
