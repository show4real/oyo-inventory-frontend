import React from "react";
import { Card, Table } from "@themesberg/react-bootstrap";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faGlobe } from "@fortawesome/free-solid-svg-icons";
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
    return items.reduce((total, item) => total + item.rate * item.quantity, 0);
  };

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

  combineItems = (items) => {
    return items.reduce((acc, item) => {
      const existingItem = acc.find(
        (i) => i.order.product_name === item.order.product_name
      );
      if (existingItem) {
        existingItem.qty_sold += item.qty_sold;
      } else {
        acc.push({ ...item });
      }
      return acc;
    }, []);
  };

  render() {
    const { invoice, company, items, pos_items } = this.props;
    const combinedItems = this.combineItems(pos_items);

    return (
      <Card style={{ padding: "10px", width: "100%" }}>
        {Object.keys(invoice).length !== 0 && (
          <div>
            <header
              style={{
                textAlign: "center",
                marginBottom: "10px",
                fontSize: "24px",
              }}
            >
              <h1 style={{ fontWeight: "bold" }}>{company?.name || ""}</h1>
              <div>
                <FontAwesomeIcon icon={faPhone} /> {company.phone_one},{" "}
                {company.phone_two}
              </div>
              <div>
                <FontAwesomeIcon icon={faGlobe} /> {company.website}
              </div>
            </header>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "20px",
                marginBottom: "10px",
              }}
            >
              <div style={{ textAlign: "left" }}>
                Date: {moment(invoice.issued_date).format("MMM DD YYYY")}
                <br />
                Invoice #: {invoice.invoice_no}
                <br />
                {company.address}
              </div>
              <div style={{ textAlign: "right" }}>
                <strong>Client:</strong> {invoice.client.name}
                <br />
                {invoice.client.phone}
                <br />
                {invoice.client.address}
                <br />
                {invoice.client.email || ""}
              </div>
            </div>

            <Table
              striped
              bordered
              hover
              style={{ marginBottom: "10px", fontSize: "20px" }}
            >
              <thead>
                <tr>
                  <th style={{ fontSize: "20px" }}>Product</th>
                  <th style={{ fontSize: "20px" }}>Qty</th>
                  <th style={{ fontSize: "20px" }}>Price</th>
                  <th style={{ fontSize: "20px" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td
                      style={{ fontSize: "20px", textTransform: "uppercase" }}
                    >
                      {item.description}
                    </td>
                    <td style={{ fontSize: "20px" }}>{item.quantity}</td>
                    <td style={{ fontSize: "20px" }}>
                      {this.formatCurrency(item.rate)}
                    </td>
                    <td style={{ fontSize: "20px" }}>
                      {this.formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
                {combinedItems.map((item, index) => (
                  <tr key={index}>
                    <td style={{ fontSize: "20px" }}>
                      {item.order.product_name}
                    </td>
                    <td style={{ fontSize: "20px" }}>{item.qty_sold}</td>
                    <td style={{ fontSize: "20px" }}>
                      {this.formatCurrency(item.selling_price)}
                    </td>
                    <td style={{ fontSize: "20px" }}>
                      {this.formatCurrency(item.selling_price * item.qty_sold)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <div
              style={{
                fontWeight: "bold",
                fontSize: "22px",
                textAlign: "right",
                marginBottom: "10px",
              }}
            >
              Total: {this.formatCurrency2(invoice.amount)}
              {invoice.total_balance > 0 && (
                <>
                  <br />
                  Balance: {this.formatCurrency2(invoice.total_balance)}
                </>
              )}
            </div>

            <footer
              style={{
                fontSize: "20px",
                marginTop: "10px",
                textAlign: "center",
              }}
            >
              <div>{company?.invoice_footer_one}</div>
              <div>{company?.invoice_footer_two}</div>
              <div style={{ fontWeight: "bold", marginTop: "10px" }}>
                Cashier: {invoice.cashier_name}
              </div>
            </footer>
          </div>
        )}
      </Card>
    );
  }
}

export default Invoice;
