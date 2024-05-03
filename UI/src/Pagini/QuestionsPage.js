import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBBtn,
  MDBInputGroup,
  MDBInput,
  MDBContainer,
  MDBRadio,
  MDBRow, MDBCol
} from 'mdb-react-ui-kit';


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
  const [timerExpired, setTimerExpired] = useState(false);


  useEffect(() => {
    if (showTimer && timeRemaining === 0) {
      setTimerExpired(true);
      // Restul codului pentru tratarea expirării timerului
    }
  }, [showTimer, timeRemaining]);

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

  const allQuestionsAnswered = questions.every((question) =>
    responses.some((response) => response.id === question.id && response.response !== '')
  );
  const allQuestionsAnsweredOrTimerExpired = allQuestionsAnswered || timerExpired;
  const getColorBasedOnTimeRemaining = (timeRemaining) => {
    if (timeRemaining <= 10) {
      // Dacă mai sunt 10 secunde sau mai puțin, culoarea este roșie
      return '#FF0000';
    } else if (timeRemaining <= 30) {
      // Dacă mai sunt 30 de secunde sau mai puțin, culoarea este portocalie
      return '#FF8E00';
    } else if (timeRemaining <= 60) {
      // Dacă mai este 1 minut sau mai puțin, culoarea este galbenă
      return '#FFD700';
    } else {
      // Pentru mai mult de 1 minut, culoarea este verde
      return '#00C853';
    }
  };

  return (
    <MDBContainer className="my-5">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div>
          <h1 style={{ textAlign: 'center', margin: '0' }}>Chestionarul Holland</h1>
        </div>
        <div>
          <MDBBtn rounded className='mx-2' color='secondary' onClick={() => window.location.href = '/'}>
            Homepage
          </MDBBtn>

        </div>
      </div>
      {/* Card pentru validarea e-mailului */}
      {currentPage === 1 && !emailValidated && (
        <MDBCard alignment="center" className="mb-4">

          <MDBCardBody>
            <MDBCardText>Introduceți o adresă de e-mail validă pentru a continua:</MDBCardText>
            <MDBInputGroup className="mb-3">
              <MDBInput
                label="E-mail"
                id="typeEmail"
                type="email"
                value={email}
                onChange={handleEmailChange}
                required
              />
              {showEmailValidationButton && (
                <MDBBtn color="primary" fullWidth onClick={handleEmailValidation}>
                  Verificare E-mail
                </MDBBtn>
              )}
            </MDBInputGroup>

            <MDBCardText style={{ textAlign: 'left' }}>
              <p>
                Acest chestionar măsoară interesele tale, adică preferințele tale pentru anumite activități. Hai să vedem în ce măsură acestea îți plac și să descoperim împreună ce domeniu de studiu ți s-ar potrivi.
              </p>
              <p><strong>Cum completezi acest chestionar:</strong></p>
              <ul>
                <li>Dacă o anumită activitate îți displace, bifează "Nu îmi place".</li>
                <li>Dacă o anumită activitate îți este indiferentă, bifează "Așa și așa".</li>
                <li>Dacă o anumită activitate îți place, bifează "Îmi place".</li>
              </ul>
              <p>
                Completează chestionarul gândindu-te dacă activitatea respectivă îți place sau nu îți place. Nu există răspuns corect sau răspuns greșit. Nu există limită de timp pentru a răspunde.
              </p>
            </MDBCardText>
            {/* Sfârșitul textului adăugat */}
          </MDBCardBody>
        </MDBCard>
      )}
      {/* Afișarea întrebărilor */}
      {emailValidated && (
        <MDBRow>
          {questions.map((question, index) => (
            <MDBCol key={question.id} md="12" className="mb-4">
              <MDBCard>
                <MDBCardBody>
                  <MDBCardTitle>{question.text}</MDBCardTitle>
                  {question.image_url && (
                    <img
                      src={question.image_url}
                      alt={`Imagine asociată întrebării ${index}`}
                      className="img-fluid mb-3"
                    />
                  )}

                  {showTimer && timeRemaining > 0 && question.id === currentQuestionId && (
                    <div
                      className="timer-box mb-3"
                      style={{
                        padding: '10px',
                        borderRadius: '5px',
                        backgroundColor: getColorBasedOnTimeRemaining(timeRemaining),
                      }}
                    >
                      Timp rămas: {Math.floor(timeRemaining / 60)} minute și {timeRemaining % 60} secunde
                    </div>
                  )}


                  {/* Opțiuni de răspuns */}
                  <div className="mb-3">
                    {question.responses.map((response, subIndex) => (
                      <div key={`${question.id}-${response.value}`}>
                        {/* Radio button */}
                        <MDBRadio
                          id={`${question.id}-${response.value}`}
                          name={`response-${question.id}`}
                          label={response.value}
                          value={response.value}
                          checked={responses.some(item => item.id === question.id && item.response === response.value)}
                          onChange={() => handleResponseChange(question.id, response.value)}
                          disabled={responses.some(item => item.id === question.id)}
                        />

                        {/* Imagine asociată răspunsului */}
                        {response.response_image_url && (
                          <img
                            src={response.response_image_url}
                            alt={`Imagine asociată răspunsului ${subIndex}`}
                            className={`response-image-${subIndex}`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          ))}

          {/* Paginare și trimitere răspunsuri */}
          <MDBCol md="12" className="text-center">
            <div className="pagination-container">
              <span className="pagination-text">
                Pagina {currentPage} din {totalPages}
              </span>
              <div className="pagination-buttons">
                {currentPage !== totalPages && (
                  <MDBBtn onClick={goToNextPage} className="primary">
                    Pagina următoare
                  </MDBBtn>
                )}
                {currentPage === totalPages && (
                  <div className="submit-container">
                    <button className="submit-button" onClick={handleSubmit}>
                      Trimite și vezi rezultate
                    </button>
                  </div>
                )}
              </div>

              {currentPage === totalPages && (
                <MDBBtn
                  color="primary"
                  disabled={!allQuestionsAnsweredOrTimerExpired}
                  onClick={handleSubmit}
                >
                  Trimite răspunsurile
                </MDBBtn>
              )}

            </div>
          </MDBCol>
        </MDBRow>
      )}
    </MDBContainer>
  );
};

export default QuestionsPage;