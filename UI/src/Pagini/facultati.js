import React from 'react';
import { Link } from 'react-router-dom';
import { MDBNavbar, MDBContainer, MDBNavbarNav, MDBNavbarItem, MDBRow, MDBCol } from 'mdb-react-ui-kit';

const faculties = [
    {
        name: "Facultatea Design de produs și mediu",
        icon: "/facultati/dpm.jpg",
        link: "https://dpm.unitbv.ro/ro/"
    },
    {
        name: "Facultatea de Inginerie electrică și știința calculatoarelor",
        icon: "/facultati/iesc.png",
        link: "https://iesc.unitbv.ro/ro/"
    },
    {
        name: "Facultatea de Design de mobilier și inginerie a lemnului",
        icon: "/facultati/lemn.jpg",
        link: "https://dmil.unitbv.ro/ro/"
    },
    {
        name: "Facultatea de Inginerie mecanică",
        icon: "/facultati/ar.jpg",
        link: "https://mecanica.unitbv.ro/ro/"
    },
    {
        name: "Facultatea de Inginerie tehnologică și management industrial",
        icon: "/facultati/itm.png",
        link: "https://itmi.unitbv.ro/ro/"
    },
    {
        name: "Facultatea de Silvicultură și exploatări forestiere",
        icon: "/facultati/silvic.png",
        link: "Facultatea de Silvicultură și exploatări forestiere"
    },
    {
        name: "Facultatea de Știința și ingineria materialelor",
        icon: "/facultati/materiale.png",
        link: "https://sim.unitbv.ro/ro/"
    },
    {
        name: "Facultatea de Drept",
        icon: "/facultati/drept.png",
        link: "https://drept.unitbv.ro/ro/"
    },
    {
        name: "Facultatea de Educație fizică și sporturi montane",
        icon: "/facultati/sport.jpg",
        link: "https://sport.unitbv.ro/ro/"
    },
    {
        name: "Facultatea de Litere",
        icon: "/facultati/litere.png",
        link: "https://litere.unitbv.ro/ro/"
    },
    {
        name: "Facultatea de Matematică și informatică",
        icon: "/facultati/mateinfo.jpg",
        link: "https://mateinfo.unitbv.ro/ro/"
    },
    {
        name: "Facultatea de Medicină",
        icon: "/facultati/medicina.png",
        link: "https://medicina.unitbv.ro/ro/"
    },
    {
        name: "Facultatea de Muzică",
        icon: "/facultati/muzica.png",
        link: "https://muzica.unitbv.ro/ro/"
    },
    {
        name: "Facultatea de Psihologie și științele educației",
        icon: "/facultati/psiho.png",
        link: "https://psihoedu.unitbv.ro/ro/"
    },
    {
        name: "Facultatea de Sociologie și comunicare",
        icon: "/facultati/socio.jpg",
        link: "https://socio.unitbv.ro/ro/"
    },
    {
        name: "Facultatea de Științe economice și administrarea afacerilor",
        icon:  "/facultati/econ.jpg",
        link: "https://econ.unitbv.ro/ro/"
    },
    {
        name: "Facultatea de Alimentație și turism",
        icon: "/facultati/alimentatie.png",
        link: "https://at.unitbv.ro/ro/"
    },
    {
        name: "Facultatea de Construcții",
        icon: "/facultati/constructi.png",
        link: "https://constructii.unitbv.ro/ro/"
    }
];

const Faculties = () => {
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
                        <MDBNavbarItem>
                            <Link to="/facultati" className="nav-link">Facultăți</Link>
                        </MDBNavbarItem>
                        <MDBNavbarItem>
                            <a href="https://admitere.unitbv.ro" className="nav-link">Admitere</a>
                        </MDBNavbarItem>
                        <MDBNavbarItem>
                            <Link to="/contact" className="nav-link">Contact</Link>
                        </MDBNavbarItem>
                        <MDBNavbarItem>
                            <Link to="/Grafice" className="nav-link">Admin</Link>
                        </MDBNavbarItem>
                    </MDBNavbarNav>
                </MDBContainer>
            </MDBNavbar>
            <br />
            <MDBContainer>
               
                <MDBRow>
                    {faculties.map((faculty, index) => (
                        <MDBCol md="4" key={index} className="mb-4">
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                <a href={faculty.link} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                                    <img src={faculty.icon} alt={faculty.name} style={{ width: '40px', height: '40px', marginRight: '10px' }} />
                                    <span>{faculty.name}</span>
                                </a>
                            </div>
                        </MDBCol>
                    ))}
                </MDBRow>
            </MDBContainer>
        </>
    );
}

export default Faculties;
