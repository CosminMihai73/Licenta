import React from 'react';
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBIcon } from 'mdb-react-ui-kit';

function ErrorPage() {
  return (
    <MDBContainer className="mt-5">
      <MDBRow className="justify-content-center">
        <MDBCol md="8" lg="6" className="text-center">
          <MDBCard className="shadow-lg">
            <MDBCardBody className="p-5">
              <MDBIcon icon="exclamation-triangle" fas size="4x" className="text-danger mb-3" />
              <h1 className="display-4 text-danger">Oops!</h1>
              <p className="lead mb-4">Ne pare rău, a apărut o eroare neașteptată.</p>
              <p>Înapoi la <a href="/" className="text-primary">pagina principală</a> sau încearcă reîncărcarea paginii.</p>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

export default ErrorPage;
