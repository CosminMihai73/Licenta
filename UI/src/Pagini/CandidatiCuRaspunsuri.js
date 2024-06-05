import React, { useEffect, useMemo, useState } from 'react';
import {
  MDBBtn,
  MDBContainer,
  MDBInput,
  MDBInputGroup
} from 'mdb-react-ui-kit';

import { useTable, useSortBy } from 'react-table';
import axios from 'axios';


function CandidatiTable() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState([]);
  const [endpoint] = useState('http://127.0.0.1:8000/obitineCandidati');

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(endpoint);
      setData(response.data.candidati || []);
    } catch (error) {
      console.error('Error fetching candidati:', error);
    }
  };

  const handleSearch = async () => {
    if (searchTerm) {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/obitineCandidati/${searchTerm}`);
        setData(response.data.candidati || []);
      } catch (error) {
        console.error('Error fetching candidati:', error);
      }
    } else {
      fetchData();
    }
  };

  const handleDelete = async (email) => {
    try {
      const confirmed = window.confirm('Ești sigur că vrei să ștergi acest candidat?');
      if (confirmed) {
        await axios.delete(`http://127.0.0.1:8000/stergeCandidat/${email}`);
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting candidat:', error);
    }
  };



  const columns = useMemo(
    () => [
      {
        Header: 'Data Modificarii',
        accessor: 'Data_Modificarii',
        // Adaugă sortare pentru această coloană
        sortType: 'basic',
      },
      {
        Header: 'Id Candidat',
        accessor: 'IdCandidat',
      },
      {
        Header: 'Email',
        accessor: 'email',
      },
      {
        Header: 'Acțiuni',
        Cell: ({ row }) => (
          <MDBBtn rounded color="danger" onClick={() => handleDelete(row.original.email)} className="mt-2">
            Șterge
          </MDBBtn>
        ),
      },
    ],
    // eslint-disable-next-line
    []
  );

  const tableInstance = useTable({ columns, data }, useSortBy); // Adaugă useSortBy hook

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  const toggleRowExpansion = (rowId) => {
    setExpandedRows((prevExpandedRows) => {
      if (prevExpandedRows.includes(rowId)) {
        return prevExpandedRows.filter((id) => id !== rowId);
      } else {
        return [...prevExpandedRows, rowId];
      }
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div>
          <h1 style={{ textAlign: 'center', margin: '0' }}>Răspunsurile candidaților la chestionarul Holland</h1>
        </div>
        <div>
          <MDBBtn rounded className='mx-2' color='secondary' onClick={() => window.location.href = '/'}>
            Homepage
          </MDBBtn>
          <MDBBtn rounded className='mx-2' color='secondary' onClick={() => window.location.href = '/Grafice'}>
           Înapoi
          </MDBBtn>

        </div>
      </div>
      <MDBContainer>

        <MDBInputGroup className='mb-3'>
          <MDBInput className="me-4"
            label="Caută după email:"
            id="typeText"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}

          />
          <MDBBtn rounded color="primary" onClick={handleSearch}>
            Caută
          </MDBBtn>
        </MDBInputGroup>
      </MDBContainer>
      <table {...getTableProps()} style={{ border: '1px solid #ccc', width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#f2f2f2' }}>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())} 
                  style={{
                    padding: '10px',
                    borderBottom: '1px solid #ccc',
                    fontWeight: 'bold',
                    textAlign: 'left',
                    cursor: 'pointer', 
                  }}
                >
                  {column.render('Header')}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? ' ↓'
                        : ' ↑'
                      : ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            const isRowExpanded = expandedRows.includes(row.id);
            return (
              <React.Fragment key={row.id}>
                <tr
                  {...row.getRowProps()}
                  style={{ borderBottom: '1px solid #ccc', cursor: 'pointer' }}
                  onClick={() => toggleRowExpansion(row.id)}
                >
                  {row.cells.map((cell) => {
                    return (
                      <td
                        {...cell.getCellProps()}
                        style={{
                          padding: '10px',
                          borderBottom: '1px solid #ccc',
                          background: '#fff',
                        }}
                      >
                        {cell.render('Cell')}
                      </td>
                    );
                  })}
                </tr>
                {isRowExpanded && (
                  <tr>
                    <td colSpan={columns.length}>
                      <div style={{ padding: '10px', background: '#f9f9f9' }}>
                        <strong>Punctaje:</strong>
                        {Object.entries(row.original.Punctaje).map(([key, value]) => (
                          <div key={key}>
                            {key}: {value}
                          </div>
                        ))}
                        <br />
                        <strong>Raspunsuri:</strong>
                        {row.original.Raspunsuri.map((item) => (
                          <div key={item.id}>
                            {item.intrebare}: {item.raspuns}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default CandidatiTable;
