import React from "react";
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
import moment from "moment";
import "./style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faGlobe,
  faPhone,
  faVoicemail,
} from "@fortawesome/free-solid-svg-icons";
import { addCompanyProfile, getCompany } from "../../services/companyService";
import { toWords } from "../../services/numberWordService";

export class Invoice extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      company: props.company,

      user: props.user,
      loading: false,
      saving: false,
    };
  }

  getWords(amount) {
    return toWords(amount);
  }

  totalCost = () => {
    const { items } = this.props;
    var total = 0;
    for (let v = 0; v < items.length; v++) {
      total += items[v].rate * items[v].quantity;
    }
    return total;
  };

  formatCurrency2(x) {
    if (x !== null && x !== 0 && x !== undefined) {
      const parts = x.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `${parts.join(".")}`;
    }
    return 0;
  }

  formatCurrency(y, x) {
    if (x !== "null" && x !== "0") {
      const parts = x.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `${y}${parts.join(".")}`;
    }
    return "0";
  }

  formatProductName(productName) {
    const words = productName.split(" ");
    const chunkedWords = [];
    for (let i = 0; i < words.length; i += 3) {
      chunkedWords.push(words.slice(i, i + 3).join(" "));
    }
    return chunkedWords.join("<br/>");
  }

  formatTitle(productName) {
    const words = productName.split(" ");
    const chunkedWords = [];
    for (let i = 0; i < words.length; i += 5) {
      chunkedWords.push(words.slice(i, i + 5).join(" "));
    }
    return chunkedWords.join("<br/>");
  }

  render() {
    const { invoice, user, previous_payment, pos_items, items, company } =
      this.props;

    return (
      <Card style={{ padding: "10px", width: "100%" }}>
        {Object.keys(invoice).length !== 0 && (
          <div>
            <header>
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "10px",
                  marginTop: "5px",
                }}
              >
                {/* <img
                  src={`${company && company.logo_url}`}
                  width="100"
                  alt="Company Logo"
                /> */}
                <h1 style={{ fontWeight: 600 }}>
                  {company !== null ? company.name : ""}
                </h1>
              </div>
            </header>

            <div
              style={{
                marginBottom: "10px",
                fontWeight: 800,
                fontSize: "18px",
                textAlign: "center",
              }}
            >
              <div>
                <FontAwesomeIcon icon={faPhone} /> {company.phone_one}, &nbsp;
                {company.phone_two}
              </div>
              <div>
                <FontAwesomeIcon icon={faGlobe} />
                &nbsp;{company.website}
              </div>
            </div>

            <div
              style={{
                marginBottom: "10px",
                display: "flex",
                padding: 15,
                justifyContent: "space-between",
                fontSize: "18px",
              }}
            >
              <div style={{ textAlign: "left" }}>
                <span>
                  Date: {moment(invoice.issued_date).format("MMM DD YYYY")}
                  {invoice.due_date === invoice.issued_date
                    ? ""
                    : `  Due:` + moment(invoice.due_date).format("MMM DD YYYY")}
                </span>
                <br />
                Invoice #: {invoice.invoice_no}
                <br />
                {company && company.address}
              </div>

              <div style={{ textAlign: "right" }}>
                <span>
                  {invoice.client.name}
                  <br />
                  {invoice.client.address}
                  <br />
                  {invoice.client.phone}
                  <br />
                  {invoice.client.email !== "" ? invoice.client.email : ""}
                </span>
              </div>
            </div>

            <Table striped bordered hover style={{ marginBottom: "10px" }}>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody style={{ fontWeight: 800, fontSize: "18px" }}>
                {pos_items.map((item, key) => (
                  <tr key={key}>
                    <td
                      dangerouslySetInnerHTML={{
                        __html: this.formatProductName(
                          item.order.product_name +
                            " " +
                            item.order.product_description
                        ),
                      }}
                    ></td>
                    <td>{item.qty_sold}</td>
                    <td>{this.formatCurrency2(item.selling_price)}</td>
                    <td>
                      {this.formatCurrency2(item.selling_price * item.qty_sold)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <div style={{ marginBottom: "10px", fontWeight: 800, padding: 15 }}>
              Total: {this.formatCurrency(invoice.currency, invoice.amount)}
              <br />
              Paid:{" "}
              {this.formatCurrency(invoice.currency, invoice.total_payment)}
              <br />
              {invoice.total_balance > 0 && (
                <>
                  Balance:{" "}
                  {this.formatCurrency(invoice.currency, invoice.total_balance)}
                </>
              )}
            </div>

            <div
              style={{
                marginBottom: "10px",
                fontWeight: 800,
                padding: 10,
                fontSize: "18px",
              }}
            >
              Amount in words:{" "}
              {this.getWords(invoice.amount) + ` ` + invoice.currency}
            </div>

            <div
              style={{
                marginBottom: "10px",
                fontWeight: 800,
                padding: 10,
                fontSize: "18px",
              }}
            >
              {company && company.invoice_footer_one}
            </div>

            <div
              style={{
                fontWeight: 700,
                marginBottom: "10px",
                padding: 10,
                fontSize: "18px",
              }}
            >
              Terms and Conditions!
            </div>

            <div
              style={{ marginBottom: "10px", padding: 15, fontSize: "18px" }}
            >
              {company && company.invoice_footer_two}
            </div>

            <div
              style={{
                marginBottom: "10px",
                fontWeight: 700,
                padding: 15,
                fontSize: "18px",
              }}
            >
              Cashier: {invoice.cashier_name}
            </div>
          </div>
        )}
      </Card>
    );
  }
}
export default Invoice;
