import React from 'react';
import { Link } from 'react-router-dom';
import {
  MDBContainer,
  MDBNavbar,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBRow, MDBCol
} from 'mdb-react-ui-kit';
import { MDBCarousel, MDBCarouselItem } from 'mdb-react-ui-kit';

const HomePage = () => {

  return (
    <>
      <MDBNavbar expand='lg' light bgColor='light'>
        <MDBContainer fluid>
          <a href="/" className="navbar-brand">
            <img src="/poze/logo.png" alt="Chestionar Holland" style={{ maxWidth: '150px' }} />
          </a>
          <MDBNavbarNav className="mr-auto mb-2 mb-lg-0">
            <MDBNavbarItem>
              <Link to="/intrebari" className="nav-link">Chestionarul Holland</Link>
            </MDBNavbarItem>
            <MDBNavbarItem >
              <Link to="/facultati" className="nav-link">Facultăți</Link>
            </MDBNavbarItem>
            <MDBNavbarItem >
              <Link to="https://admitere.unitbv.ro" className="nav-link">Admitere</Link>
            </MDBNavbarItem>
            <MDBNavbarItem >
              <Link to="/contact" className="nav-link">Contact</Link>
            </MDBNavbarItem>
            <MDBNavbarItem >
              <Link to="/Grafice" className="nav-link">Admin</Link>
            </MDBNavbarItem>
          </MDBNavbarNav>
        </MDBContainer>
      </MDBNavbar>
      <br></br>
      <MDBCarousel showIndicators showControls fade >
        <MDBCarouselItem itemId={1}>
          <img src='/poze/w.webp' className='d-block w-100' alt='...' style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'cover' }} />
        </MDBCarouselItem>

        <MDBCarouselItem itemId={2}>
          <img src='/poze/w1.webp' className='d-block w-100' alt='...' style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'cover' }} />
        </MDBCarouselItem>

        <MDBCarouselItem itemId={3}>
          <img src='/poze/w2.webp' className='d-block w-100' alt='...' style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'cover' }} />
        </MDBCarouselItem>

      </MDBCarousel>

      <br></br>
      <MDBContainer>
        <MDBRow>
          <MDBCol>
            <h5>Centrul de Consiliere
              și Orientare în Carieră</h5>
            <p>este o structură a Universității Transilvania din Brașov care vine în întâmpinarea și sprijinirea studenților, absolvenților și elevilor, prin oferirea unor servicii gratuite de informare, asistență și consiliere educațională și de carieră.</p>
          </MDBCol>
          <MDBCol order='5'>
            <ul>
              <li><strong>Consiliere și orientare educațională</strong> prin optimizarea strategiilor de învățare academică.</li>
              <li><strong>Asistență în realizarea și optimizarea elementelor de marketing personal</strong> (CV-ul, scrisoarea de intenție).</li>
              <li><strong>Facilitarea relației dintre studenți și piața muncii</strong>, prin organizarea de evenimente tematice (Zilele Carierei, AFCO, workshopuri).</li>
            </ul>
          </MDBCol>
          <MDBCol order='1'>
            <ul>
              <li><strong>Consiliere și orientare</strong> în explorarea oportunităților educaționale viitoare.</li>
              <li><strong>Consiliere în explorarea</strong> oportunităților educaționale viitoare</li>
              <li><strong>Asistență psihopedagogică</strong> pentru depășirea diverselor dificultăți întâmpinate de studenți.</li>
            </ul>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </>
  );
};

export default HomePage;
