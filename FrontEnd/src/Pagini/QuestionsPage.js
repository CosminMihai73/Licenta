import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './QuestionsPage.css';

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [email, setEmail] = useState('');
  const [responses, setResponses] = useState([]);
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/questions?page=${currentPage}`);
        setQuestions(response.data.questions);
        setResponses(response.data.questions.map((question) => ({ id: question.id, raspuns: '' })));
        setTotalPages(response.data.total_pages);
        setTimeRemaining(response.data.total_time);
      } catch (error) {
        console.error('Error:', error);
        setErrorDetails(error.response?.data?.detail || 'An unknown error occurred.');
      }
    };

    fetchData();
  }, [currentPage]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const areAllQuestionsAnswered = responses.every((response) => response.raspuns !== '');
    setAllQuestionsAnswered(areAllQuestionsAnswered);

    if (areAllQuestionsAnswered && currentPage < totalPages) {
      goToNextPage();
    }
  }, [responses]);

  const handleResponseChange = (id, raspuns) => {
    setResponses((prevResponses) =>
      prevResponses.map((response) => (response.id === id ? { ...response, raspuns } : response))
    );
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const goToPreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1)); // Nu permite pagini < 1
  };

  const goToNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages)); // Nu permite pagini > totalPages
  };

  const handleSubmit = async () => {
    if (!allQuestionsAnswered) {
      alert('Vă rugăm să răspundeți la toate întrebările înainte de a trimite!');
      return;
    }

    try {
      const formattedResponses = responses.map((response) => ({
        id: response.id,
        categorie: 'string', // Schimbă valoarea 'string' dacă este necesar
        raspuns: response.raspuns
      }));

      const payload = {
        raspunsuri: formattedResponses,
        email: email
      };

      const response = await axios.post('http://localhost:8000/actualizeaza_si_calculeaza_punctaje', payload);

      setSubmissionSuccess(true);
      setErrorDetails(null);
    } catch (error) {
      console.error('Error:', error.response);
      setErrorDetails(error.response?.data?.detail || 'An unknown error occurred.');
    }
  };

  return (
    <div className="questions-container">
      <h1>Întrebări</h1>
      <div className="timer">
        <p>Timp rămas: {timeRemaining} secunde</p>
      </div>
      <div className="questions-content">
        <div className="email-input">
          <label>Email:</label>
          <input type="email" value={email} onChange={handleEmailChange} />
        </div>
        {questions.map((question) => (
          <div key={question.id} className="question-div">
            <p>{question.text}</p>
            {question.image_path && <img src={question.image_path} alt="Imagine asociată întrebării" />}
            <div className="radio-container" key={`radio-container-${question.id}`}>
              {question.responses.map((response) => (
                <label key={`${question.id}-${response.value}`}>
                  <input
                    type="radio"
                    name={`response-${question.id}`}
                    value={response.value}
                    checked={responses.find((resp) => resp.id === question.id)?.raspuns === response.value}
                    onChange={() => handleResponseChange(question.id, response.value)}
                  />
                  <span className="custom-radio"></span>
                  <span>{response.value}</span>
                  {response.response_image && <img src={response.response_image} alt="Imagine asociată răspunsului" />}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="pagination">
        <button onClick={goToPreviousPage} disabled={currentPage === 1}>Pagina anterioară</button>
        <span>Pagina {currentPage} din {totalPages}</span>
        <button onClick={goToNextPage} disabled={currentPage === totalPages}>Pagina următoare</button>
      </div>
      {errorDetails && <p style={{ color: 'red' }}>{errorDetails}</p>}
      {submissionSuccess && <p style={{ color: 'green' }}>Răspunsurile au fost trimise cu succes!</p>}
      <button onClick={handleSubmit} disabled={!allQuestionsAnswered}>Trimite</button>
    </div>
  );
};

export default QuestionsPage;
