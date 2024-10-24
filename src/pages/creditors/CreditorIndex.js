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
import { getCreditors, getProducts } from "../../services/creditorService";
import SpinDiv from "../components/SpinDiv";
import * as XLSX from "xlsx";
// import AddCreditor from "./AddCreditor";
import { throttle, debounce } from "../invoice/debounce";
import "antd/dist/antd.css";
import { Pagination } from "antd";
// import EditCreditor from "./EditCreditor";
import moment from "moment";
import ReactDatetime from "react-datetime";
// import DeleteCreditor from "./DeleteCreditor";
import { AsyncPaginate } from "react-select-async-paginate";

export class CreditorIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      page: 1,
      rows: 10,
      loading: false,
      user: JSON.parse(localStorage.getItem("user")),
      setFiltering: false,
      creditors: [],
      products: [],
      product: "",
      cashier_id: "",
      cashiers: [],
      total_balance: "",
      total_sales: "",
      total: 0,
      fromdate: moment().startOf("month"),
      todate: moment().endOf("day"),
    };
    this.searchDebounced = debounce(this.searchCreditors, 500);
    this.searchThrottled = throttle(this.searchCreditors, 500);
  }

  componentDidMount() {
    this.getCreditors();
    this.getProducts();
  }

  getProducts = (page, search) => {
    const { rows } = this.state;
    getProducts({ rows, page, search }).then(
      (res) => {
        this.setState({
          products: res.products.data.map((opt) => ({
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

  loadProducts =
    (data) =>
    async (search, loadedOptions, { page }) => {
      await this.sleep(1000);
      const { rows } = this.state;
      await this.getProducts(page, search);
      console.log(data);
      //const new_data = {data}
      let new_products = [{ label: "All Products", value: "" }, ...data];
      return {
        options: new_products,
        hasMore: data.length >= 10,
        additional: {
          page: search ? 2 : page + 1,
        },
      };
    };

  getCreditors = () => {
    const {
      page,
      rows,
      user,
      search,
      creditors,
      currency,
      product,
      fromdate,
      todate,
    } = this.state;

    this.setState({ loading: true });
    getCreditors({
      page,
      rows,
      search,
      creditors,
      currency,
      product,
      fromdate,
      todate,
    }).then(
      (res) => {
        this.setState({
          creditors: res.creditors.data,
          setFiltering: user.admin !== 1 ? true : false,
          page: res.creditors.current_page,
          total: res.creditors.total,
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
    const {
      page,
      total,
      user,
      search,
      creditors,
      currency,
      product,
      fromdate,
      todate,
    } = this.state;
    const rows = 10000;

    if (total < 1) {
      await setTimeout(
        () => this.showToast("No income history to export."),
        250
      );
    } else {
      this.setState({ loading: true });

      getCreditors({
        page,
        rows,
        search,
        creditors,
        currency,
        product,
        fromdate,
        todate,
      }).then(
        (response) => {
          let exportt = "";

          exportt = response.creditors.data.map((c) => ({
            supplier: c.supplier_name,
            product: c.product_name,
            amount: c.amount,
            balance: c.total_balance,

            date: moment(c.created_at).format("MMM DD YYYY"),
          }));

          const theheader = [
            "supplier",
            "product",
            "amount",
            "balance",

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
          XLSX.utils.book_append_sheet(wb, ws, `Creditor`);
          XLSX.writeFile(
            wb,
            `Creditors-data-from-${fromdate}-to-${todate}.xlsx`
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

  searchCreditors = () => {
    const { page, rows, search, creditors } = this.state;
    this.setState({ loading: false });
    getCreditors({ page, rows, search, creditors }).then(
      (res) => {
        this.setState({
          creditors: res.creditors.data,
          page: res.creditors.current_page,
          total: res.creditors.total,
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
    await this.getCreditors();
  };

  toggleEdit = (editCreditor) => {
    this.setState({ editCreditor });
  };

  onChange = (e, state) => {
    this.setState({ [state]: e });
  };

  onChange2 = async (e, state) => {
    await this.setState({ [state]: e });
    await this.getCreditors();
  };

  onPage = async (page, rows) => {
    await this.setState({ page, rows });
    await this.getCreditors();
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

  toggleAddCreditor = () => {
    this.setState({ addCreditor: !this.state.addCreditor });
    this.getCreditors();
  };

  toggleEditCreditor = () => {
    this.setState({ editCreditor: !this.state.editCreditor });
    this.getCreditors();
  };
  toggle = () => {
    this.setState({ deleteCreditor: !this.state.deleteCreditor });
  };

  formatCurrency(x) {
    if (x !== null && x !== 0 && x !== undefined) {
      const parts = x.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `${parts.join(".")}`;
    }
    return "0";
  }

  toggleDeleteCreditor = (deleteCreditor) => {
    this.setState({ deleteCreditor });
  };

  handleCashierChange = async (cashier) => {
    await this.setState({ cashier_id: cashier.value });
    await this.getCreditors();
  };

  handleProductChange = async (product) => {
    await this.setState({ product: product.value });
    await this.getCreditors();
  };

  render() {
    const {
      todate,
      fromdate,
      user,
      currencies,
      setFiltering,
      total_sales,
      total_balance,
      product,
      currency,
      cashiers,
      products,
      creditors,
      total,
      page,
      rows,
      search,
      loading,
      addCreditor,
      editCreditor,
      deleteCreditor,
      roles,
    } = this.state;
    console.log(setFiltering);
    return (
      <>
        {/* {addCreditor && (
          <AddCreditor
            saved={this.getCreditors}
            addCreditor={addCreditor}
            toggle={this.toggleAddCreditor}

          />
        )} */}
        {/* {deleteCreditor && (
          <DeleteCreditor
            saved={this.getCreditors}
            invoice={deleteCreditor}
            toggle={this.toggle}

          />
        )} */}
        {/* {editCreditor && (
          <EditCreditor
            saved={this.getCreditors}
            paymentss={editCreditor}
            toggle={this.toggleEditCreditor}
          />
        )} */}
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
                  <Breadcrumb.Item href="#creditors">Creditors</Breadcrumb.Item>
                </Breadcrumb>
              </div>
              <div className="btn-toolbar mb-2 mb-md-0">
                <ButtonGroup>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={this.export}
                  >
                    Export Creditors
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col md="2">
            <h5 className="mb-0">
              Creditors
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
          <Col md={4}>
            <span style={{ fontSize: 14 }}>Filter By Product: </span>
            <AsyncPaginate
              onChange={this.handleProductChange}
              loadOptions={this.loadProducts(products)}
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
                  <th className="border-0">Creditor (Supplier)</th>
                  <th className="border-0">Product</th>
                  <th className="border-0">Amount</th>
                  <th className="border-0">Balance</th>
                  <th className="border-0">Date</th>
                </tr>
              </thead>
              <tbody>
                {creditors.map((creditor, key) => {
                  return (
                    <tr style={{ fontWeight: "bold" }}>
                      <td>{creditor.supplier_name}</td>
                      <td>{creditor.product_name}</td>
                      <td>{this.formatCurrency(creditor.amount)}</td>
                      <td>{this.formatCurrency(creditor.total_balance)}</td>
                      <td>{moment(creditor.created).format("MMM DD YYYY")}</td>
                      <td>
                        <ButtonGroup>
                          <Button
                            variant="outline-primary"
                            onClick={() => {
                              this.props.history.push(
                                "/creditor/payments/" + creditor.id
                              );
                            }}
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
                {creditors.length < 1 && (
                  <div
                    style={{
                      color: "#ccc",
                      alignSelf: "center",
                      padding: 10,
                      fontSize: 13,
                    }}
                  >
                    <i className="fa fa-ban" style={{ marginRight: 5 }} />
                    No Creditor for the date Range
                  </div>
                )}
                {creditors.length > 0 && (
                  <Pagination
                    total={total}
                    showTotal={(total) => `Total ${total} creditors`}
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

export default CreditorIndex;
