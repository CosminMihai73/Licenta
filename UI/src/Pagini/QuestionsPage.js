import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './QuestionsPage.css';

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [email, setEmail] = useState('');
  const [responses, setResponses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  const [emailValidated, setEmailValidated] = useState(false);
  const [showEmailValidationButton, setShowEmailValidationButton] = useState(true);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);



  useEffect(() => {
    // Verificăm dacă e-mailul a fost validat
    if (emailValidated) {
      const fetchData = async () => {
        try {
          const response = await axios.get(`http://localhost:8000/questions?page=${currentPage}`);
          setQuestions(response.data.questions);
          setTotalPages(response.data.total_pages);
          startTimerAutomatically(response.data.questions, responses);
        } catch (error) {
          console.error('Error:', error);
        }
      };

      fetchData();
    }
  }, [currentPage, responses, emailValidated]);


  // Efect secundar pentru decrementarea timpului și gestionarea întrebărilor
useEffect(() => {
  if (showTimer && timeRemaining > 0) {
      const interval = setInterval(() => {
          setTimeRemaining(prevTime => prevTime - 1);
      }, 1000);

      return () => clearInterval(interval);
  } else if (showTimer && timeRemaining === 0 && currentQuestionId) {
      handleResponseChange(currentQuestionId, '');
      // Caută următoarea întrebare
      const currentQuestionIndex = questions.findIndex(question => question.id === currentQuestionId);
      let nextQuestionIndex = currentQuestionIndex + 1;

      // Caută următoarea întrebare cu timer, începând de la întrebarea următoare
      while (nextQuestionIndex < questions.length) {
          const nextQuestion = questions[nextQuestionIndex];

          if (nextQuestion.timer > 0) {
              // Următoarea întrebare are timer
              setCurrentQuestionId(nextQuestion.id);
              setTimeRemaining(nextQuestion.timer);
              setShowTimer(true);
              break;
          } else {
              // Treci la următoarea întrebare
              nextQuestionIndex++;
          }
      }

      // Dacă nu există alte întrebări cu timer, oprește timerul
      if (nextQuestionIndex >= questions.length) {
          setShowTimer(false);
      }
  }
   // eslint-disable-next-line react-hooks/exhaustive-deps
}, [showTimer, timeRemaining, currentQuestionId, questions]);

  const startTimerAutomatically = (questionsData, responsesData) => {
    const currentQuestion = questionsData.find(question => !responsesData.some(response => response.id === question.id));
    if (currentQuestion && currentQuestion.timer > 0) {
      const questionTimer = currentQuestion.timer || 0;
      setShowTimer(true);
      setTimeRemaining(questionTimer);
      setCurrentQuestionId(currentQuestion.id);
    }
  };

  const checkEmail = async (email) => {
    try {
      // Trimite o solicitare POST la endpointul "/check_email/"
      const response = await axios.post('http://localhost:8000/check_email/', {
        email: email,
      });

      // Returnează răspunsul primit de la server
      return response.data.exists;
    } catch (error) {
      console.error('Eroare la verificarea e-mailului:', error);
      // Poți returna un răspuns de eroare sau gestiona eroarea conform necesităților tale
      return false;
    }
  };


  const handleEmailChange = event => {
    setEmail(event.target.value);
  };

  const handleEmailValidation = async () => {
    const exists = await checkEmail(email);

    if (exists) {
      // Dacă e-mailul există, redirecționează utilizatorul către pagina `/email-exists` cu emailul ca parametru de interogare
      window.location.href = `/email-exists?email=${encodeURIComponent(email)}`;
    } else {
      // Dacă e-mailul nu există, continuă cu întrebările
      setEmailValidated(true);
      setShowEmailValidationButton(false);

      // Începe timer-ul pentru prima întrebare dacă există
      const firstQuestion = questions.find(question => question.timer > 0);
      if (firstQuestion) {
        const firstQuestionTimer = firstQuestion.timer || 0;
        setTimeRemaining(firstQuestionTimer);
        setCurrentQuestionId(firstQuestion.id);
        setShowTimer(true);
      }
    }
  };


  const handleResponseChange = (id, response) => {
    const updatedResponses = [...responses];
    const existingResponseIndex = updatedResponses.findIndex(item => item.id === id);

    // Actualizează răspunsul curent
    if (existingResponseIndex !== -1) {
        updatedResponses[existingResponseIndex] = { id, response };
    } else {
        updatedResponses.push({ id, response });
    }

    setResponses(updatedResponses);

    // Verifică întrebarea curentă
    const currentQuestion = questions.find(question => question.id === id);

    if (currentQuestion) {
        // Dacă întrebarea are un timer și s-a răspuns la ea, oprește timerul
        if (currentQuestion.timer > 0) {
            setShowTimer(false);
        }
    }

    // Caută următoarea întrebare
    const nextQuestionIndex = questions.findIndex(question => question.id === id) + 1;
    if (nextQuestionIndex < questions.length) {
        const nextQuestion = questions[nextQuestionIndex];

        // Pornește timerul pentru următoarea întrebare dacă există și are timer
        if (nextQuestion.timer > 0) {
            setCurrentQuestionId(nextQuestion.id);
            setTimeRemaining(nextQuestion.timer);
            setShowTimer(true);
        }
    }
};


  const goToNextPage = () => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages));
    window.scrollTo(0, 0);
  };

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

      window.location.href = '/rezultat';
    } catch (error) {
      console.error('Error:', error.response);
      alert('A apărut o eroare în timpul trimiterii răspunsurilor. Vă rugăm să încercați din nou mai târziu.');
    }
  };

  return (
    <div className="questions-container">
      <h1 className="questions-title">Întrebări</h1>
      {currentPage === 1 && !emailValidated && (
        <div className="email-input">
          <label className="email-label">Email:</label>
          <input type="email" value={email} onChange={handleEmailChange} className="email-input-field" />
          {showEmailValidationButton && (
            <button onClick={handleEmailValidation} className="validation-button">Trimite</button>
          )}
        </div>
      )}

      {/* Afișăm întrebările doar dacă e-mailul a fost validat */}
      {emailValidated && (
        <div className="questions-content">
          {questions.map((question, index) => (
            <div key={question.id} className={`question-div-${index}`}>
              <div className="question-container">
                <p className={`question-text-${index}`}>{question.text}</p>
                {question.image_url && (
                  <img
                    src={question.image_url}
                    alt={`Imagine asociată întrebării ${index}`}
                    className={`question-image-${index}`}
                  />
                )}

                {/* Temporizator */}
                {showTimer && timeRemaining > 0 && question.id === currentQuestionId && (
                  <div className="timer-container">
                    <p className="timer-text">
                      Timp rămas pentru această întrebare: {Math.floor(timeRemaining / 60)} minute și {timeRemaining % 60} secunde
                    </p>
                  </div>
                )}

                {/* Opțiuni de răspuns */}
                <div className={`radio-container-${index}`}>
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
                      {response.response_image_url && (
                        <img
                          src={response.response_image_url}
                          alt={`Imagine asociată răspunsului ${subIndex}`}
                          className={`response-image-${subIndex}`}
                        />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Paginare */}
          <div className="pagination-container">
            <span className="pagination-text">
              Pagina {currentPage} din {totalPages}
            </span>
            <div className="pagination-buttons">
              {currentPage !== totalPages && (
                <button onClick={goToNextPage} className="next-page-button">
                  Pagina următoare
                </button>
              )}
              {currentPage === totalPages && (
                <div className="submit-container">
                  <button className="submit-button" onClick={handleSubmit}>
                    Trimite și vezi rezultate
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionsPage;
