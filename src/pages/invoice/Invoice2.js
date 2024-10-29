import React from "react";
import { Card, Table } from "@themesberg/react-bootstrap";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { toWords } from "../../services/numberWordService";

class Invoice extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      company: props.company,
      user: props.user,
    };
  }

  getWords(amount) {
    return toWords(amount);
  }

  totalCost = () => {
    const { items } = this.props;
    return items.reduce((total, item) => total + item.rate * item.quantity, 0);
  };

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
      <Card style={{ padding: "5px", width: "100%", fontSize: "14px" }}>
        {Object.keys(invoice).length !== 0 && (
          <div>
            <header style={{ textAlign: "center", marginBottom: "5px" }}>
              <h1 style={{ fontWeight: "bold" }}>{company?.name || ""}</h1>
            </header>

            <div style={{ textAlign: "center", marginBottom: "5px" }}>
              <div>
                <FontAwesomeIcon icon={faPhone} /> {company?.phone_one}
              </div>
              <div>
                <FontAwesomeIcon icon={faGlobe} /> {company?.website}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ textAlign: "left" }}>
                Date: {moment(invoice.issued_date).format("MMM DD YYYY")}
                <br />
                Invoice #: {invoice.invoice_no}
                <br />
                {company?.address}
              </div>

              <div style={{ textAlign: "right" }}>
                {invoice.client?.address}
                <br />
                {invoice.client?.phone}
                <br />
                {invoice.client?.email || ""}
              </div>
            </div>

            <Table borderless size="sm" style={{ marginTop: "10px" }}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>{this.formatCurrency(item.rate)}</td>
                    <td>{this.formatCurrency(item.amount)}</td>
                  </tr>
                ))}
                {combinedItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.order.product_name}</td>
                    <td>{item.qty_sold}</td>
                    <td>{this.formatCurrency(item.selling_price)}</td>
                    <td>
                      {this.formatCurrency(item.selling_price * item.qty_sold)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <div style={{ fontWeight: "bold", padding: "5px 0" }}>
              Total: {this.formatCurrency(invoice.amount)}
              {invoice.total_balance > 0 && (
                <div>Balance: {this.formatCurrency(invoice.total_balance)}</div>
              )}
            </div>

            <div style={{ paddingTop: "5px", fontWeight: "bold" }}>
              {company?.invoice_footer_one}
            </div>
            <div>{company?.invoice_footer_two}</div>

            <div style={{ fontWeight: "bold", paddingTop: "5px" }}>
              Cashier: {invoice.cashier_name}
            </div>
          </div>
        )}
      </Card>
    );
  }
}

export default Invoice;
