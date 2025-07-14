class Quiz {
	constructor(correctBonus, maxQuestions, questionsUrl, quizType) {
		this.MULTIPLE_CHICE = 'multiple';
		this.WRITTEN_ANSWERS = 'written';

		// Initialize properties
		this.CORRECT_BONUS = correctBonus;
		this.MAX_QUESTIONS = maxQuestions;
		this.questionsUrl = questionsUrl;
		this.quizType = quizType;

		// DOM elements
		this.question = document.getElementById('question');
		this.nextQuestionButton = document.getElementById('btn-next-question');
		this.progressText = document.getElementById('progressText');
		this.scoreText = document.getElementById('score');
		this.progressBarFull = document.getElementById('progressBarFull');

		// Initial state
		this.currentQuestion = {};
		this.acceptingAnswers = false;
		this.score = 0;
		this.questionCounter = 0;
		this.availableQuestions = [];
		this.questions = [];

		// Fetch questions from the provided URL
		this.fetchQuestions();
	}

	// Method to fetch the questions
	fetchQuestions() {
		fetch(this.questionsUrl)
			.then((res) => res.json())
			.then((loadedQuestions) => {
				this.questions = loadedQuestions;
				this.startGame();
			})
			.catch((err) => console.error(err));
	}

	// Method to start the game
	startGame() {
		this.questionCounter = 0;
		this.score = 0;
		this.availableQuestions = [...this.questions];
		this.getNewQuestion();

		this.nextQuestionButton.addEventListener('click', () => {
			this.getNewQuestion();
		});
	}

	// Method to get a new question
	getNewQuestion() {
		this.nextQuestionButton.style.display = "none";
		if (this.availableQuestions.length === 0 || this.questionCounter >= this.MAX_QUESTIONS) {
			localStorage.setItem('mostRecentScore', this.score);
			localStorage.setItem('questionsData', `${this.score / this.CORRECT_BONUS}/${this.MAX_QUESTIONS}`);
			return window.location.assign('/TarotQuiz/end.html');
		}

		this.questionCounter++;
		this.progressText.innerText = `Question ${this.questionCounter}/${this.MAX_QUESTIONS}`;
		this.progressBarFull.style.width = `${(this.questionCounter / this.MAX_QUESTIONS) * 100}%`;

		const questionIndex = Math.floor(Math.random() * this.availableQuestions.length);
		this.currentQuestion = this.availableQuestions[questionIndex];
		this.question.innerText = this.currentQuestion.question;

		if (this.quizType === this.MULTIPLE_CHICE) {
			this.SetupQuizMultipleChoices(questionIndex);
		} else if (this.quizType === this.WRITTEN_ANSWERS) {
			this.SetupQuizWrittenAnswers();
		}

		this.acceptingAnswers = true;
	}

	// Method to increment the score
	incrementScore(num) {
		this.score += num;
		this.scoreText.innerText = this.score;
	}

	// Helper function for generating random numbers for choices (used for multiple-choice)
	getRandomNumbers(maxQuestions, rightAnswer) {
		let numbers = [];
		while (numbers.length < 4) {
			let randomNum = Math.floor(Math.random() * maxQuestions);
			if (!numbers.includes(randomNum) && randomNum !== rightAnswer) {
				numbers.push(randomNum);
			}
		}
		return numbers;
	}

	// M choices - DOM Elements
	SetupQuizMultipleChoices(questionIndex) {
		const choices = this.GetChoices();

		// randomly pick answers from other questions
		const wrongAnswers = this.getRandomNumbers(this.availableQuestions.length, questionIndex);

		choices.forEach((choice) => {
			const number = choice.dataset['number'];
			choice.innerText = this.availableQuestions[wrongAnswers[number - 1]].answer;
		});

		// set the right answer with currentQuestion
		const rightAnswerIndex = Math.floor(Math.random() * 4);
		choices[rightAnswerIndex].innerText = this.currentQuestion.answer;

		// reset display
		choices.forEach((choice) => {
			choice.parentElement.classList.remove('correct');
			choice.parentElement.classList.remove('incorrect');
		});
	}

	GetChoices()
	{
		return Array.from(document.getElementsByClassName('choice-text'));
	}

	// Method to handle answer selection (for multiple-choice)
	handleChoiceSelection() {
		const choices = this.GetChoices();

		choices.forEach((choice) => {
			choice.addEventListener('click', (e) => {
				if (!this.acceptingAnswers) return;

				this.acceptingAnswers = false;
				const selectedChoice = e.target;
				const selectedAnswer = selectedChoice.innerText;

				let classToApply = '';
				if (selectedAnswer === this.currentQuestion.answer) {
					classToApply = 'correct';
					this.incrementScore(this.CORRECT_BONUS);
				} else {
					classToApply = 'incorrect';
					choices.forEach((choice) => {
						if (choice.innerText === this.currentQuestion.answer) {
							choice.parentElement.classList.add('correct');
						}
					});
				}

				selectedChoice.parentElement.classList.add(classToApply);

				setTimeout(() => {
					this.nextQuestionButton.style.display = "block";
				}, 1000);
			});
		});
	}

	// Get w choices - DOM Elements
	SetupQuizWrittenAnswers() {
		this.acceptingAnswers = true;

		const inputAnswer = this.GetInputAnswer();
		const answerComment = this.GetLblAnswerComment();

		inputAnswer.disabled = false;
		inputAnswer.value = '';
		answerComment.innerText = '';
	}

	GetInputAnswer() {
		return document.getElementById('inputAnswer');
	}

	GetLblAnswerComment() {
		return document.getElementById('lbl-answer-comment');
	}

	// Method for written answer callback
	answerSubmitCallBack() {
		const inputAnswer = this.GetInputAnswer();
		const answerComment = this.GetLblAnswerComment();

		if (!this.acceptingAnswers) return;

		this.acceptingAnswers = false;
		inputAnswer.disabled = true;
		if (inputAnswer.value === this.currentQuestion.answer) {
			answerComment.classList.remove('incorrect-label');
			answerComment.classList.add('correct-label');
			answerComment.innerText = 'Correct!';
			this.incrementScore(this.CORRECT_BONUS);
		} else {
			answerComment.classList.remove('correct-label');
			answerComment.classList.add('incorrect-label');
			answerComment.innerText = `The answer is: ${this.currentQuestion.answer}`;
		}

		setTimeout(() => {
			this.nextQuestionButton.style.display = "block";
		}, 1000);
	}
}