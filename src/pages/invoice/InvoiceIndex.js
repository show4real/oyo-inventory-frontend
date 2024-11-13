import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CardHeader, Media, Input, Badge } from "reactstrap";
import {
  faAngleDown,
  faAngleUp,
  faCheck,
  faCog,
  faHome,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
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
import {
  getInvoices,
  getClients,
  getCashiers,
} from "../../services/invoiceService";
import SpinDiv from "../components/SpinDiv";
import AddInvoice from "./AddInvoice";
import { throttle, debounce } from "./debounce";
import * as XLSX from "xlsx";
import "antd/dist/antd.css";
import { Pagination } from "antd";
import EditInvoice from "./EditInvoice";
import moment from "moment";
import ReactDatetime from "react-datetime";
import DeleteInvoice from "./DeleteInvoice";
import { AsyncPaginate } from "react-select-async-paginate";
import { currencies } from "./Currency";

export class InvoiceIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      page: 1,
      rows: 10,
      loading: false,
      company: JSON.parse(localStorage.getItem("company")),
      user: JSON.parse(localStorage.getItem("user")),
      setFiltering: false,
      invoices: [],
      clients: [],
      order: "",
      cashier_id: "",
      cashiers: [],
      total_balance: "",
      total_sales: "",
      total: 0,
      fromdate: moment().startOf("month"),
      todate: moment().endOf("day"),
      currencies: currencies,
      currency: "NGN",
    };
    this.searchDebounced = debounce(this.searchInvoices, 500);
    this.searchThrottled = throttle(this.searchInvoices, 500);
  }

  componentDidMount() {
    this.getInvoices();
    this.getClients();
    this.getCashiers();
  }

  getClients = (page, search) => {
    const { rows } = this.state;
    getClients({ rows, page, search }).then(
      (res) => {
        this.setState({
          clients: res.clients.data.map((opt) => ({
            label: opt.name,
            value: opt.id,
          })),
        });
      },
      (error) => {
        this.setState({ loading: false });
      }
    );
  };

  getCashiers = (rows, page, search) => {
    getCashiers({ rows, page, search }).then(
      (res) => {
        console.log(res);
        this.setState({
          cashiers: res.cashiers.data.map((opt) => ({
            label: opt.name,
            value: opt.id,
          })),
        });
      },
      (error) => {
        this.setState({ loading: false });
      }
    );
  };

  sleep = (ms) =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });

  export = async () => {
    const { page, search, total, invoices, currency, fromdate, todate } =
      this.state;
    const rows = 1000;
    if (total < 1) {
      await setTimeout(
        () => this.showToast("No income history to export."),
        250
      );
    } else {
      this.setState({ loading: true });

      getInvoices({
        page,
        rows,
        search,
        invoices,
        currency,
        fromdate,
        todate,
      }).then(
        (response) => {
          let exportt = "";
          exportt = response.invoices.data.map((c) => ({
            client: c.client_name,
            cashier: c.cashier_name,
            currency: c.currency,
            amount: this.formatCurrency(c.amount),
            balance: c.total_balance,
            issuedDate: moment(c.issued_date).format("MMM DD YYYY"),
            dueDate: moment(c.due_date).format("MMM DD YYYY"),
          }));

          const theheader = [
            "client",
            "cashier",
            "currency",
            "amount",
            "balance",
            "issuedDate",
            "dueDate",
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
          XLSX.utils.book_append_sheet(wb, ws, `Invoice`);
          XLSX.writeFile(wb, `invoice-history-${fromdate}-${todate}-.xlsx`);
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

  loadClients =
    (data) =>
    async (search, loadedOptions, { page }) => {
      await this.sleep(1000);
      const { rows } = this.state;
      await this.getClients(page, search);
      console.log(data);
      //const new_data = {data}
      let new_clients = [{ label: "All Clients", value: "" }, ...data];
      return {
        options: new_clients,
        hasMore: data.length >= 10,
        additional: {
          page: search ? 2 : page + 1,
        },
      };
    };

  loadCashiers =
    (data) =>
    async (search, prevOptions, { page }) => {
      await this.sleep(1000);
      const { rows } = this.state;
      await this.getCashiers(rows, page, search);
      let new_cashiers = [{ label: "All Cashiers", value: "" }, ...data];
      return {
        options: new_cashiers,
        hasMore: data.length >= 1,
        additional: {
          page: search ? 2 : page + 1,
        },
      };
    };

  getInvoices = () => {
    const {
      page,
      rows,
      user,
      search,
      invoices,
      currency,
      order,
      cashier_id,
      fromdate,
      todate,
    } = this.state;
    console.log(cashier_id);
    this.setState({ loading: true });
    getInvoices({
      page,
      rows,
      search,
      invoices,
      currency,
      order,
      cashier_id,
      fromdate,
      todate,
    }).then(
      (res) => {
        this.setState({
          invoices: res.invoices.data,
          setFiltering:
            user.admin !== 1 && res.company.cashier_daily_filter !== 1
              ? true
              : false,
          page: res.invoices.current_page,
          total: res.invoices.total,
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

  searchInvoices = () => {
    const { page, rows, search, cashier_id, invoices } = this.state;
    this.setState({ loading: false });
    getInvoices({ page, rows, cashier_id, search, invoices }).then(
      (res) => {
        this.setState({
          invoices: res.invoices.data,
          page: res.invoices.current_page,
          total: res.invoices.total,
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
    await this.getInvoices();
  };

  toggleEdit = (editInvoice) => {
    this.setState({ editInvoice });
  };

  onChange = (e, state) => {
    this.setState({ [state]: e });
  };

  onChange2 = async (e, state) => {
    await this.setState({ [state]: e });
    await this.getInvoices();
  };

  onPage = async (page, rows) => {
    await this.setState({ page, rows });
    await this.getInvoices();
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

  toggleAddInvoice = () => {
    this.setState({ addInvoice: !this.state.addInvoice });
    this.getInvoices();
  };

  toggleEditInvoice = () => {
    this.setState({ editInvoice: !this.state.editInvoice });
    this.getInvoices();
  };
  toggle = () => {
    this.setState({ deleteInvoice: !this.state.deleteInvoice });
  };

  formatCurrency(x) {
    if (x !== null && x !== 0 && x !== undefined) {
      const parts = x.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `${parts.join(".")}`;
    }
    return "0";
  }

  toggleDeleteInvoice = (deleteInvoice) => {
    this.setState({ deleteInvoice });
  };

  handleCashierChange = async (cashier) => {
    await this.setState({ cashier_id: cashier.value });
    await this.getInvoices();
  };

  handleClientChange = async (client) => {
    await this.setState({ order: client.value });
    await this.getInvoices();
  };

  render() {
    const {
      todate,
      fromdate,
      user,
      currencies,
      setFiltering,
      company,
      total_sales,
      total_balance,
      order,
      currency,
      cashiers,
      clients,
      invoices,
      total,
      page,
      rows,
      search,
      loading,
      addInvoice,
      editInvoice,
      deleteInvoice,
      roles,
    } = this.state;
    console.log(setFiltering);
    return (
      <>
        {addInvoice && (
          <AddInvoice
            saved={this.getInvoices}
            addInvoice={addInvoice}
            toggle={this.toggleAddInvoice}
          />
        )}
        {deleteInvoice && (
          <DeleteInvoice
            saved={this.getInvoices}
            invoice={deleteInvoice}
            toggle={this.toggle}
          />
        )}
        {editInvoice && (
          <EditInvoice
            saved={this.getInvoices}
            paymentss={editInvoice}
            toggle={this.toggleEditInvoice}
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
                  <Breadcrumb.Item href="#Invoices">Invoices</Breadcrumb.Item>
                </Breadcrumb>
              </div>
              <div className="btn-toolbar mb-2 mb-md-0">
                <ButtonGroup>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => {
                      //console.log('111')
                      this.props.history.push("/new/invoice");
                    }}
                  >
                    + New Invoice
                  </Button>
                  {user.admin == 1 && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={this.export}
                    >
                      Export Invoice
                    </Button>
                  )}
                </ButtonGroup>
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col md="2">
            <h5 className="mb-0">
              Invoices
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
                required:
                  user.admin !== 1 && company.cashier_daily_filter == 0
                    ? true
                    : false,
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

          <Col md="4" className="">
            <div style={{ display: "flex" }}>
              <Input
                placeholder="Search..."
                autoFocus
                id="show"
                value={search}
                style={{ maxHeight: 45, marginRight: 5, marginBottom: 10 }}
                onChange={this.handleSearch}
              />
            </div>
          </Col>
        </Row>
        <Row>
          <Col md={4} style={{ marginBottom: 20 }}>
            <Form.Group className="mb-2">
              <span style={{ fontSize: 14 }}>Filter By Currency</span>

              <Form.Select
                onChange={async (e) => {
                  await this.onChange2(e.target.value, "currency");
                }}
                style={{
                  marginRight: 10,
                  width: "100%",
                }}
              >
                <option value="">Select Currency</option>
                {currencies.length == 0 && ""}
                {currencies.map((p, index) => (
                  <option value={p.abbrev} key={p}>
                    {p.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          {user.admin === 1 && (
            <Col md={4}>
              <span style={{ fontSize: 14 }}>Filter By Cashier</span>
              <AsyncPaginate
                onChange={this.handleCashierChange}
                loadOptions={this.loadCashiers(cashiers)}
                additional={{
                  page: 1,
                  type: "clients",
                }}
              />
            </Col>
          )}
          <Col md={4}>
            <span style={{ fontSize: 14 }}>Filter By Customer: </span>
            <AsyncPaginate
              onChange={this.handleClientChange}
              loadOptions={this.loadClients(clients)}
              additional={{
                page: 1,
              }}
            />
          </Col>
        </Row>
        <Row>
          {currency && (
            <>
              <Col md={4}>
                <h5 style={{ fontWeight: "bold" }}>
                  Total Sales: {currency}
                  {this.formatCurrency(total_sales)}
                </h5>
              </Col>
              <Col md={4}>
                <h5 style={{ fontWeight: "bold" }}>
                  Total Balance: {currency}
                  {this.formatCurrency(total_balance)}
                </h5>
              </Col>
            </>
          )}
        </Row>

        <Card border="light" className="shadow-sm mb-4">
          <Card.Body className="pb-0">
            <Table
              responsive
              className="table-centered table-nowrap rounded mb-0"
            >
              <thead className="thead-light">
                <tr>
                  <th className="border-0">Invoice No</th>
                  <th className="border-0">Channel</th>
                  <th className="border-0">Client Name</th>
                  <th className="border-0">Cashier</th>
                  <th className="border-0">Total Purchase</th>
                  <th className="border-0">Balance</th>
                  <th className="border-0">Issue Date</th>
                  {/* <th className="border-0">Due Date</th> */}
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, key) => {
                  return (
                    <tr style={{ fontWeight: "bold" }}>
                      <td>{invoice.invoice_no}</td>
                      <td>{invoice.payment_type}</td>
                      <td>{invoice.client_name}</td>
                      <td>{invoice.cashier_name}</td>
                      <td>
                        {invoice.currency}
                        {this.formatCurrency(invoice.amount)}
                      </td>
                      <td>
                        {invoice.currency}
                        {this.formatCurrency(invoice.total_balance)}
                      </td>
                      <td>
                        {moment(invoice.created_at).format(
                          "MMM DD YYYY h:mm A"
                        )}
                      </td>

                      {/* <td>
                        {moment(invoice.due_date).format("MMM DD YYYY h:mm A")}
                      </td> */}

                      <td>
                        <ButtonGroup>
                          <Button
                            variant="outline-primary"
                            onClick={() => {
                              this.props.history.push("/invoice/" + invoice.id);
                            }}
                            size="sm"
                          >
                            View
                          </Button>
                          {invoice.payment_type == "POS" && (
                            <Button
                              variant="outline-primary"
                              onClick={() => {
                                this.props.history.push("/pos/" + invoice.id);
                              }}
                              size="sm"
                            >
                              Edit
                            </Button>
                          )}
                          <Button
                            variant="outline-danger"
                            // disabled={invoice.payment_type == 'POS' ? true : false}
                            onClick={() => {
                              this.toggleDeleteInvoice(invoice);
                            }}
                            size="sm"
                          >
                            Delete
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
                {invoices.length > 0 && (
                  <Pagination
                    showSizeChanger
                    defaultCurrent={6}
                    total={total}
                    showTotal={(total) => `Total ${total} Invoices`}
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

export default InvoiceIndex;
