import React, { Component } from "react";
import {
  Col,
  Row,
  Nav,
  Card,
  Table,
  Form,
  Button,
  ButtonGroup,
  Breadcrumb,
  InputGroup,
  Dropdown,
} from "@themesberg/react-bootstrap";
import { getExpenses } from "../../services/creditorService";
import SpinDiv from "../components/SpinDiv";
import AddExpense from "./AddExpense";
import { throttle, debounce } from "../invoice/debounce";
import "antd/dist/antd.css";
import { Pagination } from "antd";
import EditExpense from "./EditExpense";
import moment from "moment";
import ReactDatetime from "react-datetime";
import * as XLSX from "xlsx";
import { AsyncPaginate } from "react-select-async-paginate";

export class ExpenseIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      page: 1,
      rows: 10,
      loading: false,
      user: JSON.parse(localStorage.getItem("user")),
      setFiltering: false,
      expenses: [],
      total: 0,
      total_expenses: "",
      fromdate: moment().startOf("month"),
      todate: moment().endOf("day"),
    };
    this.searchDebounced = debounce(this.searchExpenses, 500);
    this.searchThrottled = throttle(this.searchExpenses, 500);
  }

  componentDidMount() {
    this.getExpenses();
  }

  sleep = (ms) =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });

  getExpenses = () => {
    const { page, rows, user, search, expenses, fromdate, todate } = this.state;

    this.setState({ loading: true });
    getExpenses({ page, rows, search, expenses, fromdate, todate }).then(
      (res) => {
        this.setState({
          expenses: res.expenses.data,
          total_expenses: res.total_expenses,
          setFiltering: user.admin !== 1 ? true : false,
          page: res.expenses.current_page,
          total: res.expenses.total,
          total_sales: res.total_sales,
          total_balance: res.total_balance,
          loading: false,
        });
      },
      (error) => {
        this.setState({ loading: false });
      }
    );
  };

  export = async () => {
    const { page, user, search, expenses, fromdate, todate, total } =
      this.state;
    const rows = 10000;

    if (total < 1) {
      await setTimeout(
        () => this.showToast("No income history to export."),
        250
      );
    } else {
      this.setState({ loading: true });

      getExpenses({
        page,
        rows,
        user,
        search,
        expenses,
        fromdate,
        todate,
      }).then(
        (response) => {
          let exportt = "";

          exportt = response.expenses.data.map((c) => ({
            paid_by: c.paid_by,
            receiver: c.creditor_id !== null ? c.supplier_name : c.receiver,
            payment_mode: c.payment_mode,
            amount: this.formatCurrency(c.amount_paid),
            payment_type: c.payment_type,
            date: moment(c.created_at).format("MMM DD YYYY"),
          }));

          const theheader = [
            "paid_by",
            "receiver",
            "payment_mode",
            "amount",
            "payment_type",
            "date",
          ];
          const wch = [30, 20, 15, 20, 40, 20, 20, 20, 20];
          const cols = wch.map((h) => {
            return { wch: h };
          });
          const thedata = exportt.map((item) => {
            return theheader.map((item2) => {
              return item[item2];
            });
          });

          const headerTitle = "your header title here";

          const allofit = [theheader].concat(thedata);

          const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(allofit);

          const wb: XLSX.WorkBook = XLSX.utils.book_new(headerTitle);
          ws["!cols"] = cols;
          XLSX.utils.book_append_sheet(wb, ws, `Expenses`);
          XLSX.writeFile(
            wb,
            `Expenses-data-from-${fromdate}-to-${todate}.xlsx`
          );
          this.setState({
            loading: false,
          });
        },
        (error) => {
          this.setState({ loading: false });
        }
      );
    }
  };

  searchExpenses = () => {
    const { page, rows, search, expenses } = this.state;
    this.setState({ loading: false });
    getExpenses({ page, rows, search, expenses }).then(
      (res) => {
        this.setState({
          expenses: res.expenses.data,
          total_expenses: res.total_expenses,
          page: res.expenses.current_page,
          total: res.expenses.total,
          loading: false,
        });
      },
      (error) => {
        this.setState({ loading: false });
      }
    );
  };

  onFilter = async (e, filter) => {
    await this.setState({ [filter]: e });
    await this.getExpenses();
  };

  toggleEdit = (editExpense) => {
    this.setState({ editExpense });
  };

  onChange = (e, state) => {
    this.setState({ [state]: e });
  };

  onChange2 = async (e, state) => {
    await this.setState({ [state]: e });
    await this.getExpenses();
  };

  onPage = async (page, rows) => {
    await this.setState({ page, rows });
    await this.getExpenses();
  };

  handleSearch = (event) => {
    this.setState({ search: event.target.value }, () => {
      if (this.state.search < 5) {
        this.searchThrottled(this.state.search);
      } else {
        this.searchDebounced(this.state.search);
      }
    });
  };

  toggleAddExpense = () => {
    this.setState({ addExpense: !this.state.addExpense });
    this.getExpenses();
  };

  toggleEditExpense = (expense) => {
    this.setState({ editExpense: expense });
    this.getExpenses();
  };
  toggle = () => {
    this.setState({ deleteExpense: !this.state.deleteExpense });
  };

  formatCurrency(x) {
    if (x !== null && x !== 0 && x !== undefined) {
      const parts = x.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `NGN${parts.join(".")}`;
    }
    return "0";
  }

  toggleDeleteExpense = (deleteExpense) => {
    this.setState({ deleteExpense });
  };

  render() {
    const {
      todate,
      fromdate,
      total_expenses,
      setFiltering,
      expenses,
      total,
      page,
      rows,
      search,
      loading,
      addExpense,
      editExpense,
      deleteExpense,
    } = this.state;

    return (
      <>
        {addExpense && (
          <AddExpense
            saved={this.getExpenses}
            addExpense={addExpense}
            toggle={() => this.setState({ addExpense: null })}
          />
        )}

        {editExpense && (
          <EditExpense
            saved={this.getExpenses}
            expense={editExpense}
            toggle={() => this.setState({ editExpense: null })}
          />
        )}

        {loading && <SpinDiv text={"Loading..."} />}

        <Row style={{}}>
          <Col lg="12">
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
              <div className="d-block mb-4 mb-md-0">
                <Breadcrumb
                  listProps={{
                    className: " breadcrumb-text-dark text-primary",
                  }}
                >
                  <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
                  <Breadcrumb.Item href="#expenses">Expenses</Breadcrumb.Item>
                </Breadcrumb>
              </div>
              <div className="btn-toolbar mb-2 mb-md-0">
                <ButtonGroup>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={this.export}
                  >
                    Export Expenses
                  </Button>

                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => this.toggleAddExpense()}
                  >
                    + New Expense
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col md="2">
            <h5 className="mb-0">
              Expenses
              <span
                style={{ color: "#aaa", fontSize: 14, fontWeight: "normal" }}
              >
                {" "}
                ({total})
              </span>
            </h5>
          </Col>
          <Col md={3}>
            <ReactDatetime
              value={setFiltering === false ? fromdate : todate}
              dateFormat={"MMM D, YYYY"}
              closeOnSelect
              onChange={(e) => this.onFilter(e, "fromdate")}
              inputProps={{
                disabled: setFiltering,
                className: "form-control date-filter",
              }}
              isValidDate={(current) => {
                return (
                  (current.isBefore(todate) || current.isSame(todate)) &&
                  current.isBefore(moment())
                );
              }}
              timeFormat={false}
            />
          </Col>

          <Col md={3}>
            <ReactDatetime
              value={todate}
              dateFormat={"MMM D, YYYY"}
              closeOnSelect
              onChange={(e) => this.onFilter(e, "todate")}
              inputProps={{
                required: true,
                className: "form-control date-filter",
              }}
              isValidDate={(current) => {
                return (
                  (current.isAfter(fromdate) || current.isSame(fromdate)) &&
                  current.isBefore(moment())
                );
              }}
              timeFormat={false}
            />
            -
          </Col>
        </Row>
        <Row>
          <Col md="4" className="">
            <div style={{ display: "flex" }}>
              <div style={{ fontSize: 20, color: "red", fontWeight: "bold" }}>
                Total Expenditure: {this.formatCurrency(total_expenses)}
              </div>
            </div>
          </Col>
        </Row>

        <Card border="light" className="shadow-sm mb-4">
          <Card.Body className="pb-0">
            <Table
              responsive
              className="table-centered table-nowrap rounded mb-0"
            >
              <thead className="thead-light">
                <tr>
                  <th className="border-0">Paid By</th>
                  <th className="border-0">Receiver</th>
                  <th className="border-0">Mode of Payment</th>
                  <th className="border-0">Amount</th>
                  <th className="border-0">Channel</th>
                  <th className="border-0">Date</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense, key) => {
                  return (
                    <tr
                      style={{
                        fontWeight: "bold",
                        textTransform: "capitalize",
                      }}
                    >
                      <td>{expense.paid_by}</td>
                      <td>
                        {expense.creditor_id !== null
                          ? expense.supplier_name
                          : expense.receiver}
                      </td>
                      <td>{expense.payment_mode}</td>
                      <td>{this.formatCurrency(expense.amount_paid)}</td>
                      <td>{expense.payment_type}</td>
                      <td>
                        {moment(expense.created_at).format("MMM DD YYYY")}
                      </td>
                      <td>
                        <ButtonGroup>
                          <Button
                            variant="outline-primary"
                            onClick={() => this.toggleEditExpense(expense)}
                            size="sm"
                          >
                            View
                          </Button>
                        </ButtonGroup>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <Row>
              <Col md={12} style={{ fontWeight: "bold", paddingTop: 3 }}>
                {expenses.length < 1 && (
                  <div
                    style={{
                      color: "#ccc",
                      alignSelf: "center",
                      padding: 10,
                      fontSize: 13,
                    }}
                  >
                    <i className="fa fa-ban" style={{ marginRight: 5 }} />
                    No Expenses Found
                  </div>
                )}
                {expenses.length > 0 && (
                  <Pagination
                    total={total}
                    showTotal={(total) => `Total ${total} expenses`}
                    onChange={this.onPage}
                    pageSize={rows}
                    current={page}
                  />
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </>
    );
  }
}

export default ExpenseIndex;
