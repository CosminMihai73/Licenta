import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './QuestionsPage.css';

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [email, setEmail] = useState('');
  const [tempResponses, setTempResponses] = useState({});
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
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          window.location.href = '/'; // Redirecționează utilizatorul către pagina de acasă
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleResponseChange = (id, response) => {
    setTempResponses(prevResponses => ({
      ...prevResponses,
      [id]: response
    }));
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const goToNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    window.scrollTo(0, 0); // Facem scroll în partea de sus a paginii
  };

  const handleSubmit = async () => {
    if (currentPage !== totalPages) {
      console.log('Răspunsurile au fost salvate temporar:', tempResponses);
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

      setSubmissionSuccess(true);
      setErrorDetails(null);
    } catch (error) {
      console.error('Error:', error.response);
      setErrorDetails(error.response?.data?.detail || 'An unknown error occurred.');
    }
  };

  // Calculăm minutele și secundele rămase din timpul total
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="questions-container">
      <h1 className="questions-title">Întrebări</h1>
      <div className="timer-container">
        <p className="timer-text">Timp rămas: {minutes} minute și {seconds} secunde</p>
      </div>
      <div className="questions-content">
        <div className="email-input">
          <label className="email-label">Email:</label>
          <input type="email" value={email} onChange={handleEmailChange} className="email-input-field" />
        </div>
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
      <div className="pagination-container">
        <span className="pagination-text">Pagina {currentPage} din {totalPages}</span>
        {currentPage !== totalPages && (
          <button onClick={goToNextPage} className="next-page-button">Pagina următoare</button>
        )}
      </div>
      {currentPage === totalPages && (
        <div className="submit-container">
          {errorDetails && <p className="error-details">{errorDetails}</p>}
          {submissionSuccess && <p className="submission-success">Răspunsurile au fost trimise cu succes!</p>}
          <button onClick={handleSubmit} className="submit-button">Trimite</button>
        </div>
      )}
    </div>
  );
};

export default QuestionsPage;
