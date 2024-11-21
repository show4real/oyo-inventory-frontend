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
      // Find an existing item with the same product_name and selling_price
      const existingItem = acc.find(
        (i) =>
          i.order.product_name === item.order.product_name &&
          i.selling_price === item.selling_price
      );

      if (existingItem) {
        // Increment qty_sold if an item with matching name and price exists
        existingItem.qty_sold += item.qty_sold;
      } else {
        // Push the item as a new entry if no match was found
        acc.push({ ...item });
      }

      return acc;
    }, []);
  };

  render() {
    const { invoice, company, items, pos_items, total_balance, prev_balance } =
      this.props;
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
                Invoice #: {invoice.invoice_no}
                <br />
                {company.address}
              </div>
              <div style={{ textAlign: "right", fontWeight: "bold" }}>
                <strong>Customer</strong>
                <br />
                {invoice.client.name}
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
                  <th style={{ fontSize: "20px", fontWeight: "bold" }}>
                    Product
                  </th>
                  <th style={{ fontSize: "20px", fontWeight: "bold" }}>Qty</th>
                  <th style={{ fontSize: "20px", fontWeight: "bold" }}>
                    Price
                  </th>
                  <th style={{ fontSize: "20px", fontWeight: "bold" }}>
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {combinedItems.map((item, index) => (
                  <tr key={index}>
                    <td
                      style={{
                        fontSize: "20px",
                        textTransform: "uppercase",
                        fontWeight: "bold",
                      }}
                    >
                      {item.order.product_name}
                    </td>
                    <td style={{ fontSize: "20px", fontWeight: "bold" }}>
                      {item.qty_sold}
                    </td>
                    <td style={{ fontSize: "20px", fontWeight: "bold" }}>
                      {this.formatCurrency(item.selling_price)}
                    </td>
                    <td style={{ fontSize: "20px", fontWeight: "bold" }}>
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
              Total: {invoice.currency}
              {this.formatCurrency2(invoice.amount)}
              <br />
              Paid: {invoice.currency}
              {this.formatCurrency2(invoice.amount_paid)}
              <br />
              Balance: {invoice.currency}
              {invoice.amount - invoice.amount_paid}
              <br />
              Previous Balance: {invoice.currency}
              {prev_balance}
              <br />
              Total Balance: {invoice.currency}
              {this.formatCurrency2(total_balance)}
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
