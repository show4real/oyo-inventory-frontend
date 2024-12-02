import React, { Component, createRef } from "react";
import { Pagination } from "antd";
import { Col, Row, Card, Table, Button } from "@themesberg/react-bootstrap";
import moment from "moment";
import { getCompany } from "../../services/companyService";
import { withRouter } from "react-router-dom";
import InvoiceBalance from "./InvoiceBalance";
import ReactToPrint from "react-to-print";

class ClientPayments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        client_invoices_payments: { data: [], total: 0, current_page: 1 },
        total_balance: 0,
        balance: 0,
        prev_balance: 0,
      },
      rows: 5,
      page: 1,
      loading: false,
      company: {},
      user: JSON.parse(localStorage.getItem("user")) || null,
    };
    this.printRef = createRef();
  }

  componentDidMount() {
    this.fetchPayments();
    this.getCompany();
  }

  getCompany = async () => {
    this.setState({ loading: true });
    try {
      const res = await getCompany();
      this.setState({ company: res.company, loading: false });
    } catch (error) {
      console.error("Error fetching company details:", error);
      this.setState({ loading: false });
    }
  };

  onPage = (page, rows = this.state.rows) => {
    this.setState({ page, rows }, this.fetchPayments);
  };

  formatCurrency = (amount) => {
    if (amount !== null && amount !== 0 && amount !== undefined) {
      const parts = amount.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join(".");
    }
    return "0";
  };

  fetchPayments = async () => {
    const { id } = this.props.match.params;
    const { rows, page, user } = this.state;

    this.setState({ loading: true });

    try {
      const response = await fetch(
        `https://teejay-store-api.hamzealdigital.com/api/clients/payments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            client_id: id,
            rows,
            page,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch payments.");
      }

      const result = await response.json();
      this.setState({
        data: result,
        total: result.client_invoices_payments.total,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching client payments:", error);
      this.setState({ loading: false });
    }
  };

  render() {
    const { data, loading, total, rows, page, company, user } = this.state;

    return (
      <>
        {/* Hidden Invoice for Printing */}
        <div style={{ display: "none" }}>
          {data.client_invoices_payments.data.length > 0 && (
            <InvoiceBalance
              invoice={data.client_invoices_payments.data[0]}
              company={company}
              total_balance={data.total_balance}
              prev_balance={data.prev_balance}
              last_paid={data.last_paid}
              total_amount={data.total_amount}
              total_paid={data.total_paid}
              user={user}
              ref={(el) => (this.componentRef = el)}
              toggle={() => this.setState({ invoice: {} })}
            />
          )}
        </div>

        <div className="container-fluid mt-5">
          <Card>
            <Card.Body>
              <Card.Title>Customer Payment Summary</Card.Title>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <div>
                  <p>
                    <strong>Customer Name:</strong>{" "}
                    {data.client_invoices_payments.data.length > 0 &&
                      data.client_invoices_payments.data[0].client_name}
                  </p>

                  <p>
                    <strong>Total Purchases:</strong> NGN{" "}
                    {data.client_invoices_payments.data.length > 0 &&
                      this.formatCurrency(data.total_amount)}
                  </p>

                  <p>
                    <strong>Previous Balance:</strong> NGN{" "}
                    {data.client_invoices_payments.data.length > 0 &&
                      this.formatCurrency(
                        data.total_amount - (data.total_paid - data.last_paid)
                      )}
                  </p>
                  <p>
                    <strong>Paid:</strong> NGN{" "}
                    {data.client_invoices_payments.data.length > 0 &&
                      this.formatCurrency(data.last_paid)}
                  </p>
                  {/* <p>
                    <strong>Total Paid:</strong> NGN{" "}
                    {data.client_invoices_payments.data.length > 0 &&
                      this.formatCurrency(data.total_paid)}
                  </p> */}
                  <p style={{ paddingBottom: 20 }}>
                    <strong>Total Balance:</strong> NGN{" "}
                    {this.formatCurrency(data.total_amount - data.total_paid)}
                  </p>
                  {data.client_invoices_payments.data.length > 0 && (
                    <ReactToPrint
                      trigger={() => (
                        <Button variant="outline-success" size="sm">
                          Print Balance
                        </Button>
                      )}
                      content={() => this.componentRef}
                    />
                  )}
                </div>
              )}
            </Card.Body>

            {/* Pagination */}
            <Row>
              <Col md={12} style={{ fontWeight: "bold", paddingTop: 30 }}>
                {total > 0 && (
                  <Pagination
                    showSizeChanger
                    current={page}
                    total={total}
                    showTotal={(total) => `Total ${total} Invoices`}
                    onChange={this.onPage}
                    pageSize={rows}
                  />
                )}
              </Col>
            </Row>

            {/* Invoice Data */}
            {data.client_invoices_payments.data.map((invoice, key) => (
              <div key={key}>
                <div
                  style={{
                    display: "inline-table",
                    fontSize: 18,
                    fontWeight: "bold",
                    paddingBottom: 35,
                    paddingTop: 35,
                  }}
                >
                  <span style={{ paddingLeft: 20 }}>
                    Invoice No: {invoice.invoice_no}
                  </span>
                  <span style={{ paddingLeft: 20 }}>
                    Amount: {invoice.amount}
                  </span>
                  <span style={{ paddingLeft: 20 }}>
                    Total Payment : {invoice.amount_paid}
                  </span>
                  <span style={{ paddingLeft: 20 }}>
                    Balance: {invoice.amount - invoice.amount_paid}
                  </span>
                  <span style={{ paddingLeft: 20 }}>
                    Date: {moment(invoice.created_at).format("MMM DD YYYY")}
                  </span>
                  <span style={{ paddingLeft: 20 }}>
                    Cashier: {invoice.cashier_name}
                  </span>
                </div>
                <Table
                  responsive
                  className="table-centered table-nowrap rounded mb-0"
                >
                  <thead className="thead-light">
                    <tr>
                      <th className="border-0">No</th>
                      <th className="border-0">Inv No</th>
                      <th className="border-0">Paid</th>
                      <th className="border-0">Transaction Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.payments.map((payment, idx) => (
                      <tr key={idx} style={{ fontWeight: "bold" }}>
                        <td>{idx + 1}</td>
                        <td>{payment.invoice_num}</td>

                        <td>
                          {invoice.currency}
                          {this.formatCurrency(payment.amount_paid)}
                        </td>
                        <td>
                          {moment(payment.created_at).format("MMM DD YYYY")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ))}
          </Card>
        </div>
      </>
    );
  }
}

export default withRouter(ClientPayments);
