import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './QuestionsPage.css';

// Componentul pentru pagina de întrebări
const QuestionsPage = () => {
  // State-urile pentru a gestiona datele și starea componentei
  const [questions, setQuestions] = useState([]); // Stocarea întrebărilor
  const [email, setEmail] = useState(''); // Stocarea adresei de email
  const [responses, setResponses] = useState([]); // Stocarea răspunsurilor la întrebări
  const [currentPage, setCurrentPage] = useState(1); // Pagina curentă a întrebărilor
  const [totalPages, setTotalPages] = useState(1); // Numărul total de pagini
  const [timeRemaining, setTimeRemaining] = useState(0); // Timpul rămas pentru fiecare întrebare
  const [showTimer, setShowTimer] = useState(false); // Control pentru afișarea cronometrului
  const [emailValidated, setEmailValidated] = useState(false); // Control pentru validarea emailului
  const [showEmailValidationButton, setShowEmailValidationButton] = useState(true); // Control pentru afișarea butonului de validare a emailului
  const [currentQuestionId, setCurrentQuestionId] = useState(null); // ID-ul întrebării curente

  // Funcția useEffect pentru a prelua datele întrebărilor la încărcarea componentei și la schimbarea paginii sau a răspunsurilor
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/questions?page=${currentPage}`);
        setQuestions(response.data.questions); // Setarea întrebărilor din răspunsul API
        setTotalPages(response.data.total_pages); // Setarea numărului total de pagini
        if (currentPage !== 1 || emailValidated) {
          startTimerAutomatically(response.data.questions, responses); // Pornirea cronometrului automat dacă este necesar
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData(); // Apelarea funcției de preluare a datelor
  }, [currentPage, responses, emailValidated]);

  // Funcția useEffect pentru a gestiona cronometrul
  useEffect(() => {
    if (showTimer && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining(prevTime => prevTime - 1);
      }, 1000);

      return () => clearInterval(interval);
    } else if (showTimer && timeRemaining === 0 && currentQuestionId) {
      handleResponseChange(currentQuestionId, ''); // Gestionează răspunsurile
      setCurrentQuestionId(currentQuestionId + 1); // Trecerea la următoarea întrebare
      const nextQuestionTimer = questions.find(question => question.id === currentQuestionId + 1)?.timer || 0;
      setTimeRemaining(nextQuestionTimer); // Setarea timpului rămas pentru următoarea întrebare
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTimer, timeRemaining, currentQuestionId, questions],);

  // Funcție pentru a porni cronometrul automat
  const startTimerAutomatically = (questionsData, responsesData) => {
    const currentQuestion = questionsData.find(question => !responsesData.some(response => response.id === question.id));
    if (currentQuestion) {
      const questionTimer = currentQuestion.timer || 0;
      setShowTimer(true);
      setTimeRemaining(questionTimer);
      setCurrentQuestionId(currentQuestion.id);
    }
  };

  // Funcție pentru a gestiona modificările emailului
  const handleEmailChange = event => {
    setEmail(event.target.value);
  };

  // Funcție pentru a valida emailul
  const handleEmailValidation = () => {
    setEmailValidated(true);
    setShowEmailValidationButton(false);
    setShowTimer(true);
    const firstQuestionTimer = questions[0]?.timer || 0;
    setTimeRemaining(firstQuestionTimer);
    setCurrentQuestionId(questions[0]?.id);
  };

  // Funcție pentru a gestiona schimbările de răspunsuri
  const handleResponseChange = (id, response) => {
    const updatedResponses = [...responses];
    const existingResponseIndex = updatedResponses.findIndex(item => item.id === id);
    if (existingResponseIndex !== -1) {
      updatedResponses[existingResponseIndex] = { id, response };
    } else {
      updatedResponses.push({ id, response });
    }

    setResponses(updatedResponses); // Actualizarea răspunsurilor

    const unansweredQuestions = questions.filter(question => !updatedResponses.some(item => item.id === question.id));
    if (unansweredQuestions.length > 1) {
      const nextQuestion = unansweredQuestions[0];
      const nextQuestionTimer = nextQuestion.timer || 0;
      setShowTimer(true);
      setTimeRemaining(nextQuestionTimer);
      setCurrentQuestionId(nextQuestion.id);
    } else {
      setShowTimer(false);
    }
  };

  // Funcție pentru a trece la următoarea pagină de întrebări
  const goToNextPage = () => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages));
    window.scrollTo(0, 0);
  };

  // Funcție pentru a trimite răspunsurile
  const handleSubmit = async () => {
    const nonEmptyResponses = responses.filter(response => response.response !== '');
    const allQuestionsAnswered = questions.every(question => nonEmptyResponses.some(item => item.id === question.id));

    if (!allQuestionsAnswered) {
      alert('Te rugăm să completezi toate întrebările înainte de a trimite răspunsurile.');
      return;
    }

    try {
      const formattedResponses = nonEmptyResponses.map(({ id, response }) => ({
        id,
        categorie: 'string',
        raspuns: response
      }));

      const payload = {
        raspunsuri: formattedResponses,
        email: email
      };

      await axios.post('http://localhost:8000/actualizeaza_si_calculeaza_punctaje', payload);

      window.location.href = '/rezultat'; // Redirecționare către pagina de rezultate
    } catch (error) {
      console.error('Error:', error.response);
      alert('A apărut o eroare în timpul trimiterii răspunsurilor. Vă rugăm să încercați din nou mai târziu.');
    }
  };

  // Renderizarea componentei
  return (
    <div className="questions-container">
      <h1 className="questions-title">Întrebări</h1>
      <div className="questions-content">
        {currentPage === 1 && !emailValidated && (
          <div className="email-input">
            <label className="email-label">Email:</label>
            <input type="email" value={email} onChange={handleEmailChange} className="email-input-field" />
            {showEmailValidationButton && <button onClick={handleEmailValidation} className="validation-button">Trimite</button>}
          </div>
        )}
        {questions.map((question, index) => (
          <div key={question.id} className={`question-div-${index}`}>
            <div className="question-container">
              <p className={`question-text-${index}`}>{question.text}</p>
              {question.image_url && <img src={question.image_url} alt={`Imagine asociată întrebării ${index}`} className={`question-image-${index}`} />}
              {showTimer && timeRemaining > 0 && question.id === currentQuestionId && (
                <div className="timer-container">
                  <p className="timer-text">Timp rămas pentru această întrebare: {Math.floor(timeRemaining / 60)} minute și {timeRemaining % 60} secunde</p>
                </div>
              )}
              <div className={`radio-container-${index}`} key={`radio-container-${question.id}`}>
                {question.responses.map((response, subIndex) => (
                  <label key={`${question.id}-${response.value}`} className={`response-label-${subIndex}`}>
                    <input
                      type="radio"
                      name={`response-${question.id}`}
                      value={response.value}
                      checked={responses.some(item => item.id === question.id && item.response === response.value)}
                      onChange={() => handleResponseChange(question.id, response.value)}
                      className={`response-input-${subIndex}`}
                      disabled={responses.some(item => item.id === question.id)}
                    />
                    <span className={`custom-radio-${subIndex}`}></span>
                    <span className={`response-value-${subIndex}`}>{response.value}</span>
                    {response.response_image_url && <img src={response.response_image_url} alt={`Imagine asociată răspunsului ${subIndex}`} className={`response-image-${subIndex}`} />}
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="pagination-container">
        <span className="pagination-text">Pagina {currentPage} din {totalPages}</span>
        <div className="pagination-buttons">
          {currentPage !== totalPages && (
            <button onClick={goToNextPage} className="next-page-button">Pagina următoare</button>
          )}
          {currentPage === totalPages && (
            <div className="submit-container">
              <button className="submit-button" onClick={handleSubmit}>Trimite și vezi rezultate</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionsPage;
