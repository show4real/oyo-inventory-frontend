import React, { Component } from "react";
import { Input, Media, Modal } from "reactstrap";
import { toast } from "react-toastify";
import {
  Col,
  Row,
  Card,
  Table,
  Button,
  ButtonGroup,
  Breadcrumb,
  Form,
} from "@themesberg/react-bootstrap";
import SpinDiv from "../components/SpinDiv";
import { getTransactionDetails } from "../../services/posOrderService";
import moment from "moment";
import ReactToPrint from "react-to-print";
import { Invoice } from "./Invoice";

export class TransactionDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      page: 1,
      rows: 10,
      loading: false,
      transaction_detail: [],
      transaction_id: props.transaction_id,
      toggle: props.toggle,
      company: JSON.parse(localStorage.getItem("company")),
    };
  }

  componentDidMount() {
    this.getTransactionDetails();
  }

  showToast = (msg) => {
    toast(<div style={{ padding: 20, color: "success" }}>{msg}</div>);
  };
  getTransactionDetails = () => {
    const { transaction_id } = this.state;
    this.setState({ loading: true });
    getTransactionDetails({ transaction_id }).then(
      (res) => {
        this.setState({
          loading: false,
          transaction_detail: res.transaction_detail,
        });
      },
      (error) => {
        this.setState({ loading: false });
      }
    );
  };

  toggleFilter = () => {
    this.setState({ showFilter: !this.state.showFilter });
  };
  // formatNumber(x) {

  //     if (x !== 'null' && x !== '0') {
  //         const parts = x.toString().split(".");
  //         parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  //         return `\u20a6${parts.join(".")}`;
  //     }
  //     return '0';
  // }

  formatNumber = (number) => {
    if (number) {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  };

  attributeCols = (attribute_name, attribute_value) => {
    if (attribute_name !== null) {
      let attributes = new Array();
      let values = new Array();
      attributes = attribute_name.split(",");
      values = attribute_value.split(",");
      return values.map((attrs, key) => {
        return (
          <p className="mb-0 text-sm" style={{ textTransform: "capitalize" }}>
            <span style={{ fontWeight: "bold" }}>{attrs + ":" + "  "}</span>
            {attributes[key]}
          </p>
        );
      });
    } else {
      return "";
    }
  };

  render() {
    const {
      transaction_detail,
      search,
      loading,
      toggle,
      transaction_id,
      company,
    } = this.state;
    var p_mode = transaction_detail.map(function (p) {
      return p.payment_mode;
    });
    var transaction_date_time = transaction_detail.map(function (p) {
      return p.created_at;
    });
    var cashier_name = transaction_detail.map(function (p) {
      return p.cashier_name;
    });
    const transaction_total = transaction_detail
      .map((p) => p.selling_price * p.qty_sold)
      .reduce((prev, curr) => prev + curr, 0);

    return (
      <>
        <div style={{ display: "none" }}>
          {/* <Invoice
           
                cart_details={transaction_detail}
                company={company}
                transaction_id={transaction_id}
                sold_at={transaction_date_time[0]}
                payment_mode={p_mode[0]}
                ref={(el) => (this.componentRef = el)}
            /> */}
        </div>
        {loading && <SpinDiv text={"Loading..."} />}

        <Modal
          className="modal-dialog-full"
          isOpen={transaction_id != null}
          toggle={() => !loading && toggle}
          style={{ maxWidth: "70%", marginRight: "100px" }}
        >
          {/* <Row>
                        <Col md={9}></Col>
                        <Col md={3}>
                            <ReactToPrint
                            trigger={() => {
                                return (
                                <Button variant="outline-success" href="#" size="sm">
                                    RePrint Invoice
                                </Button>
                                );
                            }}
                            content={() => this.componentRef}
                            />
                        </Col>
                    </Row> */}
          <Row
            style={{
              marginTop: 10,
              color: "black",
              fontWeight: "bold",
              fontSize: 15,
            }}
          >
            <Col md={3}>
              <Card border="light" className="shadow-sm mb-4">
                <Card.Body className="pb-0">
                  Cashier
                  <h6 style={{ color: "black", fontWeight: "bold" }}>
                    {cashier_name[0]}
                  </h6>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card
                style={{ textAlign: "center", padding: 10 }}
                border="light"
                className="shadow-sm mb-4"
              >
                <Card.Body className="pb-0">
                  Transaction ID
                  <h6
                    style={{ color: "green", fontSize: 15, fontWeight: "bold" }}
                  >
                    {transaction_id}
                  </h6>
                </Card.Body>
              </Card>
            </Col>
            <Col md={2}>
              <Card border="light" className="shadow-sm mb-4">
                <Card.Body className="pb-0">
                  Payment Mode
                  <h6 style={{ color: "green", fontWeight: "bold" }}>
                    {p_mode[0]}
                  </h6>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card border="light" className="shadow-sm mb-4">
                <Card.Body className="pb-0">
                  Transaction Time
                  <h6
                    style={{
                      color: "green",
                      paddingLeft: 10,
                      marginBottom: 10,
                      fontWeight: "bold",
                    }}
                  >
                    {moment(transaction_date_time[0]).format(
                      "MMM D, YYYY hh:mm A"
                    )}
                  </h6>
                </Card.Body>
              </Card>
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
                    {console.log(transaction_detail)}
                    <th className="border-0">Product</th>
                    <th className="border-0">Selling Price</th>
                    {company.sell_by_serial_no == 1 && (
                      <th className="border-0">Serial No</th>
                    )}
                    <th className="border-0">Quantity Sold</th>

                    <th className="border-0">Supplier</th>
                    <th className="border-0">Total Sold </th>
                  </tr>
                </thead>
                <tbody>
                  {console.log(transaction_detail)}
                  {transaction_detail.map((stock, key) => {
                    return (
                      <tr key={key}>
                        <th scope="row">
                          <td>
                            <Media className="align-items-center">
                              <span className="mb-0 text-sm">
                                {stock.order.product_name}
                              </span>
                              <span
                                className="mb-0 text-sm"
                                style={{ display: "block" }}
                              >
                                {this.attributeCols(
                                  JSON.parse(stock.order.product_attributes),
                                  JSON.parse(
                                    stock.order.product_attributes_keys
                                  )
                                )}
                              </span>
                            </Media>
                          </td>
                        </th>
                        <td>
                          <span
                            className="mb-0 text-sm"
                            style={{ display: "block" }}
                          >
                            {this.formatNumber(stock.selling_price)}
                          </span>
                        </td>
                        {company.sell_by_serial_no == 1 && (
                          <td>
                            {stock.sold_serials &&
                              stock.sold_serials.map((p) => {
                                return <p>{p.serial_no}</p>;
                              })}
                          </td>
                        )}
                        <td>{stock.qty_sold}</td>
                        <td>{stock.order.supplier_name}</td>

                        <td>
                          {this.formatNumber(
                            stock.qty_sold * stock.selling_price
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td
                      colSpan={3}
                      style={{ fontSize: 20, fontWeight: "bold" }}
                    >
                      Total Transaction: {this.formatNumber(transaction_total)}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
          <div className="modal-footer" style={{ padding: "1rem" }}>
            <Button
              size="sm"
              variant="outline-primary"
              data-dismiss="modal"
              type="button"
              disabled={loading}
              onClick={toggle}
            >
              Close
            </Button>
          </div>
        </Modal>
      </>
    );
  }
}

export default TransactionDetail;
