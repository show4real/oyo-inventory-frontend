import React from "react";
import { Card, Table } from "@themesberg/react-bootstrap";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { toWords } from "../../services/numberWordService";

export class InvoiceBalance extends React.Component {
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

  formatCurrency2(x) {
    if (x) {
      const parts = x.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `${parts.join(".")}`;
    }
    return "0";
  }

  formatCurrency(x) {
    return x.toLocaleString(undefined, { minimumFractionDigits: 2 });
  }

  render() {
    const {
      invoice,
      company,
      total_balance,
      prev_balance,
      last_paid,
      total_amount,
      total_paid,
    } = this.props;

    return (
      <Card style={{ padding: "10px", width: "100%" }}>
        <div>
          <header
            style={{
              textAlign: "center",
              marginBottom: "10px",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            <h1 style={{ fontWeight: "bold" }}>{company?.name || ""}</h1>
            <div style={{ fontWeight: "bold" }}>
              <FontAwesomeIcon icon={faPhone} /> {company.phone_one},{" "}
              {company.phone_two}
            </div>
            <div style={{ fontWeight: "bold" }}>
              <FontAwesomeIcon icon={faGlobe} /> {company.website}
            </div>
          </header>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "20px",
              marginBottom: "10px",
              fontWeight: "bold",
            }}
          >
            <div style={{ textAlign: "left", fontWeight: "bold" }}>
              Date: {moment(invoice.created_at).format("MMM DD YYYY, h:mm A")}
              <br />
              Receipt Type: Customer Balance Breakdown
              <br />
              {company.address}
            </div>
            <div style={{ textAlign: "right", fontWeight: "bold" }}>
              <strong>Customer</strong>
              <br />
              {invoice.client_name}
              <br />
              {invoice.client_phone}
              <br />
              {invoice.client_address}
              <br />
              {invoice.client_email || ""}
            </div>
          </div>

          <div
            style={{
              fontWeight: "bold",
              fontSize: "22px",
              textAlign: "left",
              marginBottom: "10px",
              marginTop: 20,
              textTransform: "capitalize",
            }}
          >
            Previous Balance: {invoice.currency}
            {this.formatCurrency2(total_amount - (total_paid - last_paid))}
            <br />
            Paid: {invoice.currency}
            {this.formatCurrency2(last_paid)}
            <br />
            Ledger Balance: {invoice.currency}
            {this.formatCurrency2(total_amount - total_paid)}
          </div>

          <footer
            style={{
              fontSize: "20px",
              marginTop: "10px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            <div style={{ fontWeight: "bold" }}>
              {company?.invoice_footer_one}
            </div>
            <div style={{ fontWeight: "bold" }}>
              {company?.invoice_footer_two}
            </div>
          </footer>
        </div>
      </Card>
    );
  }
}

export default InvoiceBalance;
