// Variables of DOM
var Name = document.querySelector('.name');
var ID = document.querySelector('.ID');
var countDown = document.querySelector('.countdown');
var question = document.querySelector('.question');
var answers = Array.from(document.querySelectorAll('.answer-label'));
var radio = Array.from(document.querySelectorAll('.radio'));
var result = document.querySelector('.result');
var prev = document.querySelector('.prev');
var next = document.querySelector('.next');
var currentQ = document.querySelector('.current-question');
var totalQ = document.querySelector('.total-question');
var submit = document.querySelector('.submit');
var questionBox = document.querySelector('.question-box'); ///////////////
var answerBox = document.querySelector('.answer-box'); ///////////////////
var myData = []; // all json data
var Q; // student questions
var Ans = []; // all student answers
var rightAnswer = []; // array of all right answer of all questions
var Qcount = 1; // order of the current question
var Interval; // bool to stop interval (countdown timer)
var studentQuestions = [];
var quizFinished = 0; // bool if it is sumbitted or timeout = 1
var studentResults = [0, 0, 0, 0, 0]; // 0:wrong      1:right
var studentChoices = [
  {
    number: '',
    answer: '',
  },
  {
    number: '',
    answer: '',
  },
  {
    number: '',
    answer: '',
  },
  {
    number: '',
    answer: '',
  },
  {
    number: '',
    answer: '',
  },
];

// extract the question from the server
getQuestions(); // it take time to make the request, you may need add some delay

//handle navigation buttons next & previous
next.addEventListener('click', nextQuestion);
prev.addEventListener('click', prevQuestion);

//handle student choice on an answer
answers.forEach((answer) => {
  answer.addEventListener('click', addChoice);
});

//handle sumbit button
submit.addEventListener('click', showScore);

setTimeout(initialize, 1000); // wait 20 ms

// function to read my json file
function getQuestions() {
  var myRequest = new XMLHttpRequest(); // make an http request

  myRequest.onreadystatechange = function () {
    // if status changed do the function
    if (this.readyState == 4 && this.status == 200) {
      //0: not in initialized     1: server connection established    2:request received    3:process request   4:request finished and response is ready
      myData = JSON.parse(this.responseText); // 200: response status code okay   404: status not found
    }
  };
  myRequest.open('GET', 'html_questions.json', true); // this part of code is run first
  myRequest.send();
}

//function initialize our questions and data
function initialize() {
  // extract the data
  getStudentQuetions();

  // set the first question
  setQuestionToWeb(0);

  // start countdown timer
  startTimer(60, countDown); // 60 seconds

  // disable previous button
  prev.classList.add('end');

  //clear all radio buttons
  for (let i = 0; i < radio.length; i++) {
    radio[i].checked = false;
    radio[i].parentNode.classList.remove('active');
  }

  //get student name and id
  let studentName = prompt('What is Your Name? ');
  let studentID = prompt('What is Your ID? ');
  Name.textContent = studentName;
  ID.textContent = `${studentID}`;
}

//function generate unique distinct randem numbers from minNum to maxNum
function uniqueRandomNumbers(minNum, maxNum) {
  let arr = [];
  while (arr.length <= maxNum - minNum) {
    let r = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
    if (arr.indexOf(r) === -1) arr.push(r); // it returns the index of r in the array, -1 not exist
  }
  return arr;
}

//function extract the quetions and thier answers from myData json file
function getStudentQuetions() {
  let arr = uniqueRandomNumbers(0, 9);
  for (let i = 0; i < arr.length; i++) {
    studentQuestions[i] = myData[arr[i]];
    rightAnswer.push(studentQuestions[i].right_answer);
  }
}

//function to extract my data
function getData(x) {
  Q = studentQuestions[x].title;

  Ans = [
    studentQuestions[x].answer_1,
    studentQuestions[x].answer_2,
    studentQuestions[x].answer_3,
    studentQuestions[x].answer_4,
  ];
}

// write the question to the web page
function setQuestionToWeb(x) {
  // get our data from the object
  getData(x);

  //set our quetions
  question.textContent = `${Q}`;

  //get random number to shuffle choices
  let arr = uniqueRandomNumbers(0, 3);

  //set our choices
  for (let i = 0; i < answers.length; i++) {
    answers[arr[i]].lastElementChild.textContent = `${Ans[i]}`;
  }
}

// handle next button
function nextQuestion() {
  if (Qcount != 5) {
    Qcount++;
    currentQ.textContent = `${Qcount}`;
    setQuestionToWeb(Qcount - 1);
    prev.classList.remove('end');

    //clear all radio buttons
    for (let i = 0; i < radio.length; i++) {
      radio[i].checked = false;
      radio[i].parentNode.classList.remove('active');
    }

    // check if it was a solved question to rselect his answer
    if (studentChoices[Qcount - 1].answer != '') {
      //keep the selected answer
      let yIndex = Number(studentChoices[Qcount - 1].number);
      radio[yIndex].checked = true;
      radio[yIndex].parentNode.classList.add('active');
    }

    // disable the next button
    if (Qcount == 5) {
      next.classList.add('end');
    }
  }

  // if the student pressed sumbit show his marks
  if (quizFinished) {
    showMarks(Qcount - 1);
  }
}

// handle previous button
function prevQuestion() {
  if (Qcount != 1) {
    Qcount--;
    setQuestionToWeb(Qcount - 1);
    currentQ.textContent = `${Qcount}`;
    next.classList.remove('end');

    //clear all radio buttons
    for (let i = 0; i < radio.length; i++) {
      radio[i].checked = false;
      radio[i].parentNode.classList.remove('active');
    }
    // check if it was a solved question to reselect his answer
    if (studentChoices[Qcount - 1].answer != '') {
      //keep the selected answer
      let yIndex = Number(studentChoices[Qcount - 1].number);
      radio[yIndex].checked = true;
      radio[yIndex].parentNode.classList.add('active');
    }

    // disable the prev button
    if (Qcount == 1) {
      prev.classList.add('end');
    }
  }

  // if the student pressed sumbit show his marks
  if (quizFinished) {
    showMarks(Qcount - 1);
  }
}

function addChoice() {
  //loop on all radios buttons
  for (let i = 0; i < radio.length; i++) {
    if (radio[i].checked) {
      // select it on the web
      radio[i].parentNode.classList.add('active');

      // get the selected answer
      let questionAns = radio[i].nextElementSibling.textContent;

      //put it in the student answers
      studentChoices[Qcount - 1].number = i;
      studentChoices[Qcount - 1].answer = questionAns;

      //unselect radion button
    } else {
      radio[i].parentNode.classList.remove('active');
    }
  }
}

function calcScore() {
  let score = 0;

  for (let i = 0; i < studentChoices.length; i++) {
    if (rightAnswer[i].localeCompare(studentChoices[i].answer) == 0) {
      score++;
      studentResults[i] = 1;
    }
  }
  return score;
}

function showScore() {
  quizFinished = 1;
  clearInterval(Interval);
  let score = calcScore();
  preventChose();
  showMarks(Qcount - 1);
  Swal.fire({
    icon: 'info',
    title: `Your Score is ${score} / 5`,
    text: 'You can see your marks!',
  });
}

//function take the question number and show it is wrong or right
function showMarks(Qnum) {
  if (studentResults[Qnum] == 1) {
    result.textContent = 'Right';
    result.classList.remove('wrong');
    result.classList.add('right');
  } else {
    result.textContent = 'Wrong';
    result.classList.remove('right');
    result.classList.add('wrong');
  }
}

//function dis allow the student to re choice new answers
function preventChose() {
  answers.forEach((answer) => {
    answer.removeEventListener('click', addChoice);
  });
}

//function to perform count down of quiz
function startTimer(duration, display) {
  // duration in seconds    display: html box to show on

  Interval = setInterval(function () {
    // interval is a variable used it to stop setinterval
    // called each 1000 ms
    minutes = parseInt(duration / 60);
    seconds = parseInt(duration % 60);

    minutes = minutes < 10 ? '0' + minutes : minutes; // if less than 10 minutes show 03 mins else show 10 mins
    seconds = seconds < 10 ? '0' + seconds : seconds; // if less than 10 seconds show 03 secs else show 10 secs

    display.textContent = minutes + ':' + seconds;

    if (--duration < 0) {
      clearInterval(Interval); // interval is a variable used it to stop setinterval
      showScore();
    }
  }, 1000);
}

/*
features exist
1- shuffled questions
2- different quiz models
3- shuffled choices
4- you can see your answer
5- time limit for the exam
6- yo can edit your answer anytime before submiting or time out
7- increase the question bank and type of quizes
*/

/*
features to add
1- check id of student if exist in database or not and if hed did the quiz before or frist Time
*/
