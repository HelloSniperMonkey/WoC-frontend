import React, { useMemo, useState, useEffect } from "react";
import Navigation from "../../components/Navigation";
import style from "./Leaderboard.css";
import BTable from "react-bootstrap/Table";
import Container from "react-bootstrap/Container";
import { usePagination, useTable } from "react-table";
import { Dropdown } from "react-bootstrap";
import Loading from "../../components/leaderboard/Loading";
import { NavLink } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import styled from "styled-components";
import Button from '@mui/material/Button';


const Leaderboard = () => {
  const [fi, setFi] = useState([]);
  const [se, setSe] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function getCSV() {
      try {
        // download link of google sheet. For generation, view: https://stackoverflow.com/questions/6058146/force-download-link-on-a-google-docs-spreadsheet
        const target = `https://docs.google.com/spreadsheets/d/14XtggRxila9e9xwM7W2orMF8azf5viMPd6xX4e3G-bI/export?gid=0&format=csv`;
        const result = await fetch(target);
        const data = await result.text();
        var rows = data.toString().split("\r");

        let arr = [];
        for (let i = 0;i < rows.length;i++) {
          let str = "";
          let temp = [];
          if (i === 0) {
            for (let j = 0;j < rows[i].length;j++) {
              str += rows[i][j];
            }
            temp = str.split(",");
          } else {
            let str = "";
            for (let j = 1;j < rows[i].length;j++) {
              str += rows[i][j];
            }
            temp = str.split(",");
          }
          let x = temp[1];
          temp[1] = temp[0];
          temp[0] = Number(x);
          arr.push(temp);
        }
        arr.sort(function (a, b) {
          return a[0] - b[0];
        });

        let finalArr = [];
        for (let i = arr.length - 1;i >= 0;i--) {
          let score = {};
          score["rank"] = arr.length - i;
          score["gitid"] = arr[i][1];
          score["points"] = arr[i][0];
          finalArr.push(score);
        }
        setFi(finalArr);
        setSe(finalArr);
        setLoading(false);
      } catch (error) {
        console.log(error.message);
      }
    }
    getCSV();
  }, []);

  const columns = useMemo(
    () => [
      {
        Header: "Position",
        accessor: "rank",
      },
      {
        Header: "GitHub Handle",
        accessor: "gitid",
      },
      {
        Header: "Score",
        accessor: "points",
      },
    ],
    []
  );

  let data = useMemo(() => fi, [fi]);
  let data_dup = useMemo(() => se, [se]);

  const SearchHandler = (e) => {
    let query = e.target.value.toLowerCase();
    let temp = [];
    data_dup.forEach((user) => {
      if (user.gitid.toLowerCase().includes(query)) temp.push(user);
    });
    setFi(temp);
  };

  const tableInstance = useTable(
    { columns, data, initialState: { pageIndex: 0, pageSize: 5 } },
    usePagination
  );

  const {
    getTableBodyProps,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    nextPage,
    previousPage,
    setPageSize,
    gotoPage,
    state: { pageIndex },
  } = tableInstance;


  return (
    <>
      <Navigation />
      <div className="leader-stars"></div>
      <div className="leader-twinkling"></div>
      <div style={style}>
        <div className="space"></div>
        <div className="title mb-5 p-3">WEEK 1 LEADERBOARD</div>
        <NavLink to="/leaderboard">
          <Button variant="outlined" style={{
            backgroundColor: "#0d233b",
            boxShadow: "0 0 11px #45889b", color: "#a6d2ff", border: "2px solid #a6d2ff", borderradius: "6px", marginTop: "-3%",
          }} >OVERALL LEADERBOARD</Button>
        </NavLink>

        {loading ? (
          <Loading />
        ) : (
          <Container>
            <input
              type="search"
              name="searchBar"
              id="searchBar"
              placeholder="Search for Participants"
              onChange={(e) => SearchHandler(e)}
            />

            <div className="tablee">
              <BTable responsive borderless hover>
                <thead>
                  <th className="left-position">Position</th>
                  <th className="middle-id">Github ID</th>
                  <th className="right-score">Score</th>
                </thead>
                <tbody {...getTableBodyProps()}>
                  {page.map((row, i) => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()}>
                        {row.cells.map((cell, index) => {
                          if (cell["column"]["id"] === "gitid")
                            return (
                              <td
                                className="middle-id"
                                {...cell.getCellProps()}
                                key={index}
                              >
                                <Image
                                  alt={cell["value"]}
                                  src={
                                    "https://github.com/" +
                                    cell["value"] +
                                    ".png"
                                  }
                                />

                                {cell["value"]}

                              </td>
                            );
                          else if (cell["column"]["id"] === "rank")
                            return (
                              <td
                                className="left-position"
                                {...cell.getCellProps()}
                                key={index}
                              >
                                {cell["value"] === 1 && <Gold>1</Gold>}
                                {cell["value"] === 2 && <Silver>2</Silver>}
                                {cell["value"] === 3 && <Bronze>3</Bronze>}
                                {cell["value"] !== 1 &&
                                  cell["value"] !== 2 &&
                                  cell["value"] !== 3 && (
                                    <Text>{cell["value"]}</Text>
                                  )}
                              </td>
                            );
                          else
                            return (
                              <td
                                className="right-score"
                                {...cell.getCellProps()}
                              >
                                <Text>{cell["value"]}</Text>
                              </td>
                            );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </BTable>
              <div className="pagination">
                <div className="pagination-left">
                  <span id="pageof">
                    Page{" "}
                    <strong>
                      {pageIndex + 1} of {pageOptions.length}
                    </strong>{" "}
                  </span>
                  <div className="btn-grp">
                    <button
                      onClick={() => gotoPage(0)}
                      disabled={!canPreviousPage}
                    >
                      {"First"}
                    </button>{" "}
                    <button
                      onClick={() => previousPage()}
                      disabled={!canPreviousPage}
                    >
                      {"Previous"}
                    </button>{" "}
                    <button onClick={() => nextPage()} disabled={!canNextPage}>
                      {"Next"}
                    </button>{" "}
                    <button
                      onClick={() => gotoPage(pageCount - 1)}
                      disabled={!canNextPage}
                    >
                      {"Last"}
                    </button>{" "}
                  </div>
                </div>
                <div className="pagination-right">
                  <div className="input-group">
                    <span className="input-group-text">Go to Page: </span>
                    <input
                      type="text"
                      aria-label="First name"
                      className="form-control"
                      defaultValue={pageIndex + 1}
                      onChange={(e) => {
                        const page = e.target.value
                          ? Number(e.target.value) - 1
                          : 0;
                        gotoPage(page);
                      }}
                      style={{ width: "100px" }}
                    />
                  </div>

                  <Dropdown>
                    <Dropdown.Toggle
                      // variant='info'
                      style={{
                        backgroundColor: "#cce7ff",
                        marginLeft: "1em",
                        color: "#2e63a5",
                        borderColor: "#fff",
                      }}
                      id="dropdown-basic"
                    >
                      Items per page
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      {[5, 10, 15, 20, 25].map((pageSize) => (
                        <Dropdown.Item
                          key={pageSize}
                          value={pageSize}
                          onClick={(e) => {
                            setPageSize(pageSize);
                          }}
                        >
                          Show {pageSize}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>
            </div>
          </Container>
        )}
        <div className="space"></div>
        {/* <Footer bg="#12263F" /> */}
      </div>
      {/* <ScrollButton /> */}
    </>
  );
};

export default Leaderboard;

const Image = styled(Avatar)`
  margin: 2px 0px;
  margin-left: 15px;
  margin-right: 1rem;
`;

const SLink = styled(NavLink)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-decoration: None;
  color: #1e1e1e;
  &:hover {
    color: #838383;
  }
`;

const Text = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Gold = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #ffd700;
  border-radius: 50%;
  margin: auto;
  width: 25px;
  height: 25px;
  padding: 0.7rem;
`;

const Silver = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #c0c0c0;
  border-radius: 50%;
  margin: auto;
  width: 25px;
  height: 25px;
  padding: 0.7rem;
`;

const Bronze = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #cd7f32;
  border-radius: 50%;
  margin: auto;
  width: 25px;
  height: 25px;
  padding: 0.7rem;
`;