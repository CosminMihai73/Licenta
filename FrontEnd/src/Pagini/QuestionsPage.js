import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './QuestionsPage.css';

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [email, setEmail] = useState('');
  const [tempResponses, setTempResponses] = useState({}); // Obiect pentru stocarea temporară a răspunsurilor
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
      setTimeRemaining((prevTime) => prevTime - 1);
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

  const goToPreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1)); // Nu permite pagini < 1
  };

  const goToNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages)); // Nu permite pagini > totalPages
  };

  const handleSubmit = async () => {
    if (currentPage !== totalPages) {
      // Salvăm răspunsurile temporare într-un fișier sau în altă formă de stocare temporară
      // Puteți folosi localStorage, sessionStorage sau puteți crea un serviciu de stocare temporară pe backend
      // Aici puteți folosi și alte metode pentru stocarea temporară a datelor
      console.log('Răspunsurile au fost salvate temporar:', tempResponses);
      return;
    }

    try {
      const formattedResponses = Object.keys(tempResponses).map(id => ({
        id,
        categorie: 'string', // Schimbă valoarea 'string' dacă este necesar
        raspuns: tempResponses[id]
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
                    checked={tempResponses[question.id] === response.value}
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
      <button onClick={handleSubmit}>Trimite</button>
    </div>
  );
};

export default QuestionsPage;
