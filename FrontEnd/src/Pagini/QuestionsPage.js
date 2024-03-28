import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './QuestionsPage.css';

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [email, setEmail] = useState('');
  const [tempResponses, setTempResponses] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  const [emailValidated, setEmailValidated] = useState(false);
  const [showEmailValidationButton, setShowEmailValidationButton] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/questions?page=${currentPage}`);
        setQuestions(response.data.questions);
        setTotalPages(response.data.total_pages);

        const currentQuestionTimer = response.data.questions[currentPage - 1]?.timer || 0;
        setTimeRemaining(currentQuestionTimer);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, [currentPage]);

  useEffect(() => {
    if (showTimer && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining(prevTime => prevTime - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [showTimer, timeRemaining]);

  const handleResponseChange = (id, response) => {
    setTempResponses(prevResponses => ({
      ...prevResponses,
      [id]: response
    }));

    const currentQuestionTimer = questions[currentPage - 1]?.timer || 0;
    setTimeRemaining(currentQuestionTimer);
    setShowTimer(true);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleEmailValidation = () => {
    setShowTimer(true);
    setEmailValidated(true);
    setShowEmailValidationButton(false);
  };

  const goToNextPage = () => {
    const allQuestionsAnswered = questions.every(question => tempResponses.hasOwnProperty(question.id));
    if (allQuestionsAnswered) {
      setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages));
      window.scrollTo(0, 0);
    } else {
      alert('Te rugăm să completezi toate întrebările înainte de a trece la pagina următoare.');
    }
  };

  const handleSubmit = async () => {
    const allQuestionsAnswered = questions.every(question => tempResponses.hasOwnProperty(question.id));
    if (!allQuestionsAnswered) {
      alert('Te rugăm să completezi toate întrebările înainte de a trimite răspunsurile.');
      return;
    }

    try {
      const formattedResponses = Object.keys(tempResponses).map(id => ({
        id,
        categorie: 'string',
        raspuns: tempResponses[id]
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

  // Adaugarea clasei 'show-timer' pentru a afisa timerul
  useEffect(() => {
    const handleScroll = () => {
      const timerContainer = document.querySelector('.timer-container');
      if (timerContainer) {
        if (window.scrollY > 100) {
          timerContainer.classList.add('show-timer');
        } else {
          timerContainer.classList.remove('show-timer');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="questions-container">
      <h1 className="questions-title">Întrebări</h1>
      <div className="questions-content">
        {currentPage === 1 && !emailValidated && (
          <div className="email-input">
            <label className="email-label">Email:</label>
            <input type="email" value={email} onChange={handleEmailChange} className="email-input-field" />
            {showEmailValidationButton && <button onClick={handleEmailValidation}>Validare</button>}
          </div>
        )}
        {questions.map((question, index) => (
          <div key={question.id} className={`question-div-${index}`}>
            <p className={`question-text-${index}`}>{question.text}</p>
            {question.image_path && <img src={question.image_path} alt={`Imagine asociată întrebării ${index}`} className={`question-image-${index}`} />}
            <div className={`radio-container-${index}`} key={`radio-container-${question.id}`}>
              {question.responses.map((response, subIndex) => (
                <label key={`${question.id}-${response.value}`} className={`response-label-${subIndex}`}>
                  <input
                    type="radio"
                    name={`response-${question.id}`}
                    value={response.value}
                    checked={tempResponses[question.id] === response.value}
                    onChange={() => handleResponseChange(question.id, response.value)}
                    className={`response-input-${subIndex}`}
                  />
                  <span className={`custom-radio-${subIndex}`}></span>
                  <span className={`response-value-${subIndex}`}>{response.value}</span>
                  {response.response_image && <img src={response.response_image} alt={`Imagine asociată răspunsului ${subIndex}`} className={`response-image-${subIndex}`} />}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Timerul */}
      {(showTimer && timeRemaining > 0) && (
        <div className="timer-container">
          <p className="timer-text">Timp rămas pentru această întrebare: {Math.floor(timeRemaining / 60)} minute și {timeRemaining % 60} secunde</p>
        </div>
      )}
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
