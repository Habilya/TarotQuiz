document.addEventListener('DOMContentLoaded', () => {
	const quiz = new Quiz(10, 100, '/TarotQuiz/questions_en.json', 'multiple');
	quiz.handleChoiceSelection();
});