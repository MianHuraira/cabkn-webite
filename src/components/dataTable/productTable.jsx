"use client";

/* eslint-disable no-duplicate-imports */
/* eslint-disable no-mixed-operators */
/* eslint-disable no-use-before-define */
/* eslint-disable semi */
/* eslint-disable multiline-ternary */
/* eslint-disable no-unused-vars */

import React, { Fragment, useState } from "react";
import DataTable from "react-data-table-component";
import { Calendar, ChevronDown, Search } from "react-feather";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { MdArrowLeft, MdArrowRight } from "react-icons/md";
import ReactPaginate from "react-paginate";
import { Card, CardHeader, CardTitle, Input, Spinner } from "reactstrap";

const ProductTable = ({
  data,
  columns,
  showFilter,
  isDate = false,
  itemsPerPage,
  showRow,
  rowHeading,
  setLastId,
  count,
  loading,
  setSearch,
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const handleFilter = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (setSearch) {
      setSearch(value);
    }
    setLastId(1);
    setCurrentPage(0);
  };
  const [currentPage, setCurrentPage] = useState(0);
  const handlePagination = (page) => {
    setCurrentPage(page.selected);
    setLastId(page.selected + 1);
  };

  const Previous = () => (
    <Fragment>
      <span>
        <MdArrowLeft size={25} />
      </span>
    </Fragment>
  );

  const Next = () => (
    <Fragment>
      <span>
        <MdArrowRight size={25} />
      </span>
    </Fragment>
  );

  const CustomPagination = () => (
    <div className="bg-white rounded-b-xl border-t border-t-slate-200 px-4 sm:px-6 py-4">
      <ReactPaginate
        previousLabel={
          <div className="flex text-sm items-center gap-2 btnpgination">
            <FaArrowLeft color="#64748b" />
            <span className="medium-font">Previous</span>
          </div>
        }
        nextLabel={
          <div className="flex text-sm items-center gap-2 btnpgination">
            <span className="medium-font">Next</span>
            <FaArrowRight color="#64748b" />
          </div>
        }
        forcePage={currentPage}
        onPageChange={(page) => handlePagination(page)}
        pageCount={count}
        breakLabel="..."
        pageRangeDisplayed={2}
        marginPagesDisplayed={2}
        activeClassName="active"
        pageClassName="page-item"
        breakClassName="page-item"
        nextLinkClassName="page-link"
        pageLinkClassName="page-link"
        breakLinkClassName="page-link"
        previousLinkClassName="page-link"
        nextClassName="page-item next-item"
        previousClassName="page-item prev-item"
        containerClassName="pagination react-paginate separated-pagination pagination-sm justify-center gap-1"
      />
    </div>
  );

  // Custom table styles
  const customStyles = {
    rows: {
      style: {
        borderBottom: "1px solid #f1f5f9",
        transition: "background-color 0.15s ease-in-out",
      },
      highlightOnHoverStyle: {
        backgroundColor: "#f8fafc",
      },
    },
    headCells: {
      style: {
        backgroundColor: "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
        padding: "14px 20px",
        fontSize: "13px",
        fontWeight: 600,
        color: "#475569",
        textTransform: "none",
      },
    },
    cells: {
      style: {
        padding: "14px 20px",
      },
    },
  };

  return (
    <Fragment>
      {rowHeading && (
        <CardHeader className="flex items-center justify-between mb-3">
          <CardTitle className="bold-font" tag={"h4"}>
            {rowHeading}
          </CardTitle>
          {setSearch && (
            <div className="flex items-center flex-wrap gap-[12px] mt-2 me-2">
              <div
                style={{ width: "max-content", marginLeft: "auto" }}
                className="relative d-flex align-items-center"
              >
                <Search
                  className="absolute position-absolute text-[1rem] ms-3 text-slate-400"
                  alt=""
                />
                <Input
                  className="dataTable-filter ps-5 md:pe-5 py-[8px] w-full border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  type="text"
                  placeholder="Search anything here"
                  id="search-input-1"
                  value={searchValue}
                  onChange={handleFilter}
                />
              </div>
              {showFilter && (
                <div>
                  <button className="flex items-center gap-2 border rounded-lg py-[8px] px-[14px]">
                    <img src={filter} alt="" />
                    <span className="plusJakara_semibold text_black text-sm">
                      Filter
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </CardHeader>
      )}

      <div className="react-dataTable rounded-t-xl overflow-hidden">
        <DataTable
          noHeader
          pagination
          progressPending={loading}
          progressComponent={
            <div
              className="py-5 flex items-center justify-center"
            >
              <Spinner color="#004a70" style={{width: "24px", height: "24px"}}>Loading...</Spinner>
            </div>
          }
          selectableRowsNoSelectAll
          columns={columns}
          paginationPerPage={itemsPerPage}
          className="react-dataTable"
          sortIcon={<ChevronDown size={10} />}
          paginationDefaultPage={currentPage + 1}
          paginationComponent={CustomPagination}
          data={data}
          customStyles={customStyles}
        />
      </div>
    </Fragment>
  );
};

export default ProductTable;
